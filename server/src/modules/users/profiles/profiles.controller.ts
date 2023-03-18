import { RequestHandler } from "express";
import { db } from "../../config/db";
import { CreateProfileModel } from "./profiles.models";
import { s3 } from "../../config/upload";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { BUCKET } from "../../config/config";

const PROFILE_SELECT = {
  id: true,
  bio: true,
  userId: true,
  avatar: {
    select: {
      url: true,
      id: true,
      size: true,
      key: true,
      userId: true,
      originalName: true,
      fileType: {
        select: {
          name: true,
          id: true,
        },
      },
    },
  },
};
type FileData = {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  bucket: string;
  key: string;
  acl: string;
  contentType: string;
  metadata: Record<string, string>;
  location: string;
  etag: string;
};

export const createUserProfileHandler: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const requesterId = (req as any).userId;
    const userId = req.params.userId;
    if (requesterId !== userId)
      return res.status(403).json({ message: "Forbidden" });
    const foundUser = await db.user.findUnique({ where: { id: userId } });
    if (!foundUser) return res.status(403).json({ message: "Forbidden" });
    const foundProfile = await db.userProfile.findUnique({ where: { userId } });
    if (foundProfile)
      return res.status(400).json({ message: "Profile Already Exists" });
    const file = req.file! as any as FileData;
    const fileType = await db.fileType.findUnique({
      where: { name: file.mimetype },
    });
    if (!fileType) {
      await s3.send(
        new DeleteObjectCommand({ Bucket: BUCKET.BUCKET_NAME, Key: file.key })
      );
      return res.status(400).json({ message: "File Type Not Accepted" });
    }
    const dbFile = await db.file.create({
      data: {
        key: file.key,
        originalName: file.originalname,
        size: file.size,
        fileTypeId: fileType.id,
        userId,
        url: file.location,
      },
    });
    const userData = req.body as CreateProfileModel;

    const userProfile = await db.userProfile.create({
      data: {
        userId,
        bio: userData.bio,
        avatarId: dbFile.id,
      },
      select: PROFILE_SELECT,
    });
    return res.status(200).json(userProfile);
  } catch (error) {
    if (req.file) {
      await s3.send(
        new DeleteObjectCommand({
          Bucket: BUCKET.BUCKET_NAME,
          Key: (req.file as any as FileData).key,
        })
      );
    }
    next(error);
  }
};

export const updateUserProfileHandler: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const requesterId = (req as any).userId;
    const userId = req.params.userId;
    if (requesterId !== userId)
      return res.status(403).json({ message: "Forbidden" });
    const foundUserProfile = await db.userProfile.findUnique({
      where: { userId },
    });
    if (!foundUserProfile)
      return res.status(403).json({ message: "Forbidden" });

    const file = req.file! as any as FileData;
    const fileType = await db.fileType.findUnique({
      where: { name: file.mimetype },
    });
    if (!fileType) {
      await s3.send(
        new DeleteObjectCommand({ Bucket: BUCKET.BUCKET_NAME, Key: file.key })
      );
      return res.status(400).json({ message: "File Type Not Accepted" });
    }
    const dbFile = await db.file.upsert({
      where: {
        id:
          typeof foundUserProfile.avatarId === "string"
            ? foundUserProfile.avatarId
            : undefined,
      },
      update: {
        key: file.key,
        originalName: file.originalname,
        size: file.size,
        fileTypeId: fileType.id,

        url: file.location,
      },
      create: {
        key: file.key,
        originalName: file.originalname,
        size: file.size,
        fileTypeId: fileType.id,
        userId,

        url: file.location,
      },
    });
    const userData = req.body as CreateProfileModel;

    const userProfile = await db.userProfile.update({
      where: { userId },
      data: {
        userId,
        bio: userData.bio,
        avatarId: dbFile.id,
      },
      select: PROFILE_SELECT,
    });
    return res.status(200).json(userProfile);
  } catch (error) {
    next(error);
  }
};

export const getUserProfileHandler: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const foundProfile = await db.userProfile.findUnique({
      where: { userId },

      select: PROFILE_SELECT,
    });
    if (!foundProfile)
      return res.status(404).json({ message: "Profile Not Found" });
    return res.status(200).json(foundProfile);
  } catch (error) {
    next(error);
  }
};

export const deleteUserProfileHandler: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const requesterId = (req as any).userId;
    const userId = req.params.userId;
    if (requesterId !== userId)
      return res.status(403).json({ message: "Forbidden" });
    const userProfile = await db.userProfile.findUnique({ where: { userId } });
    if (!userProfile)
      return res.status(200).json({ message: "User Profile Deleted" });
    if (userProfile.avatarId) {
      const img = await db.file.findUnique({
        where: { id: userProfile.avatarId },
      });
      if (img) {
        await s3.send(
          new DeleteObjectCommand({
            Bucket: BUCKET.BUCKET_NAME,
            Key: img.key,
          })
        );
        await db.file.delete({ where: { id: img.id } });
      }
    }
    await db.userProfile.delete({ where: { userId } });
    return res.status(200).json({ message: "User Profile Deleted" });
  } catch (error) {
    next(error);
  }
};
