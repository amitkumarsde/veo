import { User } from "../models/user.model.js";

const AUTHOR_FIELDS = "username name avatarURL -_id";

export const userRepository = {
    create: (data) => User.create(data),
    existsByEmail: (email) => User.exists({ email }),
    existsByUsername: (username) => User.exists({ username }),
    findById: (id) => User.findById(id).lean(),
    findByIdForUpdate: (id) => User.findById(id),
    findByIdWithPassword: (id) => User.findById(id).select("+password").lean(),
    findByEmailWithPassword: (email) => User.findOne({ email }).select("+password").lean(),
    findByEmailForUpdate: (email) => User.findOne({ email }),
    findSessionById: (id) => User.findById(id).select("username +passwordChangedAt").lean(),
    findAuthors: (usernames) => User.find({ username: { $in: usernames } }).select(AUTHOR_FIELDS).lean(),
    deleteById: (id) => User.deleteOne({ _id: id }),
};
