import mongoose from "mongoose";

import { logger } from "./logger.js";

// MongoDB's "IllegalOperation": a standalone server (some local setups) has no transactions.
const TRANSACTIONS_NOT_SUPPORTED = 20;
let transactionsSupported = true;

// Runs `work` as one all-or-nothing step (one by one on a standalone MongoDB); it may run twice, so database work only.
export const inTransaction = async (work) => {
    if (!transactionsSupported) return work();
    try {
        return await mongoose.connection.transaction(() => work());
    } catch (error) {
        if (error?.code !== TRANSACTIONS_NOT_SUPPORTED) throw error;
        transactionsSupported = false;
        logger.warn("This MongoDB server has no transactions (use a replica set or Atlas); related writes now run one by one.");
        return work();
    }
};
