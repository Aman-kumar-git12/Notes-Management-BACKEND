const Validator = require('validator');

const ValidationSignupData = (req) => {
    const {name ,  email , password} = req.body
    if (!name){
        throw new Error("name is required")
    }
    else if (!Validator.isEmail(email)){
        throw new Error("Invalid email format")
    }
    else if (password.length < 6 ){
        throw new Error("Password should be strong")
    }

}

const ValidationFields = (req) => {
  const allowedEditsFields = [
    "name",
    "email",
    "age",
    "password"
  ];
  const isEditAllowed = Object.keys(req.body).every((field) =>
    allowedEditsFields.includes(field)
  );
  return isEditAllowed;
};



module.exports = {ValidationSignupData , ValidationFields};