import express from "express";
import Thread from "../models/Thread.js";
import getOpenAIResponse from "../utils/openai.js";
import authMiddleware from "../middleware/auth.js";
import { v1 as uuidv1 } from "uuid";

const router = express.Router();

// Join as Guest
router.post("/chat/guest", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({
      error: "Message is required",
    });
  }

  try {
    const aiResponse = await getOpenAIResponse(message);

    res.json({
      reply: aiResponse,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: "Failed to get response",
    });
  }
});

//GET all threads
router.get("/thread", authMiddleware, async (req, res) => {
  try {
    const threads = await Thread.find({ user: req.user.userId }).sort({
      updatedAt: -1,
    });
    res.json(threads);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to fetch threads" });
  }
});

//GET a single thread by ID
router.get("/thread/:threadId", authMiddleware, async (req, res) => {
  const { threadId } = req.params;
  try {
    const thread = await Thread.findOne({ threadId, user: req.user.userId });
    if (!thread) {
      return res.status(404).json({ error: "Thread not found" });
    }
    res.json(thread.messages);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to fetch thread" });
  }
});

// Delete a thread by ID
router.delete("/thread/:threadId", authMiddleware, async (req, res) => {
  const { threadId } = req.params;
  try {
    const deletedThread = await Thread.findOneAndDelete({
      threadId,
      user: req.user.userId,
    });
    if (!deletedThread) {
      return res.status(404).json({ error: "Thread not found" });
    }
    res.json({ message: "Thread deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to delete thread" });
  }
});

//New message in a thread
router.post("/chat", authMiddleware, async (req, res) => {
  const { threadId, message } = req.body;
  if (!message) {
    return res.status(400).json({
      error: "Message is required",
    });
  }
  try {
    let thread = null;

    if (threadId) {
      thread = await Thread.findOne({
        threadId,
        user: req.user.userId,
      });
    }
    if (!thread) {
      // If thread doesn't exist, create a new one
      const newThreadId = uuidv1();

      thread = new Thread({
        user: req.user.userId,
        threadId: newThreadId,
        title: message.substring(0, 40),
        messages: [
          {
            role: "user",
            content: message,
          },
        ],
      });
    } else {
      // If thread exists, add message to it
      thread.messages.push({ role: "user", content: message });
      thread.updatedAt = Date.now();
    }
    const aiResponse = await getOpenAIResponse(message);
    thread.messages.push({ role: "assistant", content: aiResponse });
    thread.updatedAt = Date.now();
    await thread.save();
    res.json({
      reply: aiResponse,
      threadId: thread.threadId,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to add message to thread" });
  }
});

export default router;
