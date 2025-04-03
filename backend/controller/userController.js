import UserModel from "../model/userModel.js";

import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken'
// Get a User
export const getUser = async (req, res) => {
  const id = req.params.id;

  try {
    const user = await UserModel.findById(id);
    if (user) {
      const { password, ...otherDetails } = user._doc;

      res.status(200).json(otherDetails);
    } else {
      res.status(404).json("No such User");
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

// Get all users
export const getAllUsers = async (req, res) => {

  try {
    let users = await UserModel.find();
    users = users.map((user)=>{
      const {password, ...otherDetails} = user._doc
      return otherDetails
    })
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json(error);
  }
};
export const searchUser = async (req, res) => {
  const query = req.query.q;  // Ensure you're extracting 'q' from the query string

  // Debugging log
  console.log('Received query:', query);

  if (!query) {
    return res.status(400).json({ error: "Query parameter 'q' is required" });
  }

  try {
    // Perform a case-insensitive search by username, ensuring no ObjectId related logic interferes
    const users = await UserModel.find({
      username: { $regex: new RegExp(query, "i") }, // Explicitly creating a RegExp for case-insensitive search
    }).exec();  // Using .exec() to ensure that MongoDB doesn't implicitly cast anything

    if (users.length === 0) {
      return res.status(404).json({ message: 'No users found matching the query' });
    }

    // Return the users found, excluding sensitive fields (e.g., password)
    const result = users.map(user => {
      const { password, ...otherDetails } = user._doc; // Exclude password field
      return otherDetails; // Return other details
    });

    res.status(200).json(result);  // Return the list of found users
  } catch (err) {
    console.error('Error during search:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};





// udpate a user

export const updateUser = async (req, res) => {
  const id = req.params.id;
  // console.log("Data Received", req.body)
  const { _id, currentUserAdmin, password } = req.body;
  
  if (id === _id) {
    try {
      // if we also have to update password then password will be bcrypted again
      if (password) {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(password, salt);
      }
      // have to change this
      const user = await UserModel.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      const token = jwt.sign(
        { username: user.username, id: user._id },
        process.env.JWTKEY,
        { expiresIn: "1h" }
      );
      console.log({user, token})
      res.status(200).json({user, token});
    } catch (error) {
      console.log("Error agya hy")
      res.status(500).json(error);
    }
  } else {
    res
      .status(403)
      .json("Access Denied! You can update only your own Account.");
  }
};