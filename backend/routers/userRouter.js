const router = require("express").Router();
const User = require("../model/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register / Add Account
router.post("/", async (req, res) => {
  try {
    // To get the information of user input
    const { email, password, verifyPassword } = req.body;
    // END //

    // VALIDATION //
    // Check if some fields are empty
    if ((!email, !password, !verifyPassword)) {
      return res.status(400).json({ errorMessage: "All field are required" });
    }
    // Check if password is less than 6 characters
    if (password.length < 6) {
      return res
        .status(400)
        .json({ errorMessage: "Password should contain 6 characters" });
    }
    // Check if password is match
    if (password !== verifyPassword) {
      return res
        .status(400)
        .json({ errorMessage: "Confirm password does not match" });
    }
    // END OF VALIDATION //

    // Check for Existing User
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.status(400).json({ errorMessage: "Account is already exist" });
    }
    // END //

    // Hash Password
    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(password, salt);
    // END //

    // Save new account
    const newUser = new User({
      email,
      password: hashPassword,
    });
    const saveUser = await newUser.save();
    if (saveUser) {
      res.status(401).json({ message: "New user has been successfully added" });
    }
  } catch (error) {
    // SEND ERROR //
    console.error(error);
    res.status(500).send();
    // END //
  }
});

// Login Account
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const userDetails = await User.findOne({
    email: email,
  });

  const comparePassword = bcrypt.compare(password, userDetails.password);

  if (!userDetails) {
    return res.status(401).json({ message: "Invalid username or password!" });
  }

  //   compare the original password to hash password
  const match = await bcrypt.compare(password, userDetails.password);

  //   to check if fetch user details password is equal to user input password
  if (!match)
    return res.status(401).json({ message: "Invalid username or password!" });

  // Set unique token for every user logged In
  const token = jwt.sign(
    {
      user: userDetails._id,
    },
    process.env.JWT_SECRET
  );

  //   send the token in HTTP Cookie

  res
    .cookie("token", token, {
      httpOnly: true,
    })
    .send();
});

// logout
router.post("/logout", async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.token) return res.sendStatus(204); //No content
  res.clearCookie("token", { httpOnly: true, sameSite: "None", secure: true });
  res.json({ message: "Cookie cleared" });
});

module.exports = router;
