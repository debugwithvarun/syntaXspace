
import { z } from "zod";
import { apiFetch } from "@/lib/api";

const SignupSchema = z.object({
  name: z.string()
    .min(3, "Name should be at least 3 characters long")
    .trim(),
  email: z.email("Invalid email address")
    .trim(),
  username: z.string()
   .min(1,"Username should be at least 1 character long").regex(/^[._0-9A-Za-z]+$/, {
    message: "Only letters, digits, dots (.), and underscores (_) are allowed",
  })
    .trim(),
  password: z.string()
    .min(8, "Password should be at least 8 characters long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Password and Confirm Password must match",
  path: ["confirmPassword"],
}).refine(async(data)=>{
    try {
        const response = await apiFetch(`/user?username=${data.username}`);
        const result:{result:boolean} = await response.json();
        return result.result;
      } catch {
        return false; // fail gracefully
      }
},{
    message:"Username Already Exist",
    path:["username"],
}).refine(async(data)=>{
    try {
        const response = await apiFetch(`/check_email?email=${data.email}`);
        const result:{result:boolean}= await response.json()
        return result.result;
    } catch {
        return false
    }
},{
    message:"Email Already in use",
    path:["email"]
});


export default SignupSchema;
