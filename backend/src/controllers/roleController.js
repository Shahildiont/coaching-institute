const moongoose = require("mongoose");
const roles = require("../models/Roles")

const createRole = async (req,res) => {
    try{
        const userrole = req.user?.role;
        if(userrole=="admin"){
            const {name,description} = req.body

            const isExist = await roles.findOne({
                name: name
            })

                if(isExist){
                    return res.json({message:`The role named "${name}" already exists`})
                }

                const newRole = await roles.create({name,description})

                return res.json({message:"Role is created succesfully"})

        }else{
            return res.json({message:`Your Role "${userrole}" is not authorized .Fallback rn ASAP`}) 
        }


    }catch(err){

        res.json(err)
    }
};

const getRoles = async (req,res) =>{
    try{
        // const isAdmin = decoded.role
        // const isAdmin = req.user && req.user.role === "admin";
        // const userRole = req.token.role || req.user.role;
        // console.log(userRole)
        // console.log(req.user)
        const userRole = req.user?.role;
        // console.log("Logged-in user role is:", userRole);

        if(userRole=="admin"){

        const getAll = await roles.find()

        // console.log(getAll)



        return res.json(getAll)
        }else{
           return res.json({message:`Your Role "${userRole}" is not authorized .Fallback rn ASAP`}) 
        }
        
    }catch(err){
        res.json(err)
    }
};

const updateRole = async (req,res) =>{
    
}



module.exports={
    createRole,
    getRoles
}

