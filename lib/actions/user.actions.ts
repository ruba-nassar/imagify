"use server";

import { revalidatePath } from "next/cache";

import User from "../database/models/user.model";
import { connectToDatabase } from "../database/mongoose";
import { handleError } from "../utils";

// Type definitions
interface CreateUserParams {
  clerkId: string;
  email: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  photo: string;
}

interface UpdateUserParams {
  firstName?: string | null;
  lastName?: string | null;
  username?: string;
  photo?: string;
  [key: string]: any; // Allow for flexibility
}

// Helper to handle database operations
async function withDatabase<T>(operation: () => Promise<T>): Promise<T> {
  try {
    await connectToDatabase();
    const result = await operation();
    return JSON.parse(JSON.stringify(result));
  } catch (error) {
    handleError(error);
    throw error; // Ensure the error propagates if necessary
  }
}

// CREATE
export async function createUser(user: CreateUserParams) {
  return withDatabase(async () => {
    const newUser = await User.create(user);
    return newUser;
  });
}

// READ
export async function getUserById(userId: string) {
  return withDatabase(async () => {
    const user = await User.findOne({ clerkId: userId });
    if (!user) throw new Error("User not found");
    return user;
  });
}

// UPDATE
export async function updateUser(clerkId: string, user: UpdateUserParams) {
  return withDatabase(async () => {
    const updatedUser = await User.findOneAndUpdate({ clerkId }, user, {
      new: true,
    });
    if (!updatedUser) throw new Error("User update failed");
    return updatedUser;
  });
}

// DELETE
export async function deleteUser(clerkId: string) {
  return withDatabase(async () => {
    // Find the user to delete
    const userToDelete = await User.findOne({ clerkId });
    if (!userToDelete) throw new Error("User not found");

    // Delete the user
    const deletedUser = await User.findByIdAndDelete(userToDelete._id);
    if (!deletedUser) throw new Error("Failed to delete user");

    // Revalidate path if necessary
    revalidatePath("/");

    return deletedUser;
  });
}

// USE CREDITS
export async function updateCredits(userId: string, creditFee: number) {
  return withDatabase(async () => {
    const updatedUserCredits = await User.findOneAndUpdate(
      { _id: userId },
      { $inc: { creditBalance: creditFee } },
      { new: true }
    );
    if (!updatedUserCredits) throw new Error("User credits update failed");
    return updatedUserCredits;
  });
}
