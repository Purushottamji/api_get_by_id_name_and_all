const express=require("express");
const db=require("./login_database");
const app=express();
app.use(express.json());

app.post("/register",(req,res)=>{
    const {name,email,password}=req.body;
    if(!name || !email || !password) return res.status(400).json({message:"All field are required"});

    db.query("SELECT * FROM clients WHERE email = ?",[email],(err,result)=>{
        if(err) throw err;
        if(result.length>0) return res.status(404).json({message:"User already exists"});

        db.query("INSERT INTO clients (name, email, password) VALUES(?, ?, ? )",[name,email,password],(err,result)=>{
            if(err) throw err;
            res.status(201).json({message:"User registered successfully",userId:result.insertId});
        });
    });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "All fields are required" });

  const sql = "SELECT * FROM clients WHERE email = ?";
  db.query(sql, [email], (err, result) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });

    if (result.length === 0)
      return res.status(404).json({ message: "User not found" });

    const user = result[0];
    if (password !== user.password)
      return res.status(400).json({ message: "Invalid password" });

    res.status(200).json({
      message: "User login successful",
      name: user.name,
      email: user.email,
    });
  });
});


app.listen(3000,(err)=>{
    if(err) throw err;
    console.log("Server is running");
})