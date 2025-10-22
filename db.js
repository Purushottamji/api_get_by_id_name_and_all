const mysql=require("mysql2");
const db=mysql.createConnection({
    host:"localhost",
    database:"student_db",
    user:"root",
    password:""
})

db.connect((error)=>{
    if(error) return console.log("database connection error"+error.message);
    console.log("🫸 database connected")
})

module.exports=db;