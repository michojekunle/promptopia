import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { connectToDB } from '@utils/database'
import User from '@models/user';

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        })
    ],
    callbacks: {
        async session({ session }) {
            const sessionUser = await User.findOne({
                email: session.user.email
            })
    
            session.user.id = sessionUser._id.toString();
    
            return session;
        },
        async signIn({ profile }) {
            try {
                await connectToDB();
    
                // check if a user already exists 
                const userExists = await User.findOne({
                    email: profile.email
                });
    
                // if not, create a new user
                if(!userExists) {
                    await User.create({
                        email: profile.email,
                        username: profile.name.replaceAll(" ", "").toLowerCase(),
                        image: profile.picture
                    })
                }
    
                return true;
            } catch (error) {
                console.log(error);
                return false;
            }
        }
    }
})

export { handler as GET, handler as POST };

// Github gist route.js
// import Prompt from "@models/prompt";
// import { connectToDB } from "@utils/database";

// export const GET = async (request, { params }) => {
//     try {
//         await connectToDB()

//         const prompt = await Prompt.findById(params.id).populate("creator")
//         if (!prompt) return new Response("Prompt Not Found", { status: 404 });

//         return new Response(JSON.stringify(prompt), { status: 200 })

//     } catch (error) {
//         return new Response("Internal Server Error", { status: 500 });
//     }
// }

// export const PATCH = async (request, { params }) => {
//     const { prompt, tag } = await request.json();

//     try {
//         await connectToDB();

//         // Find the existing prompt by ID
//         const existingPrompt = await Prompt.findById(params.id);

//         if (!existingPrompt) {
//             return new Response("Prompt not found", { status: 404 });
//         }

//         // Update the prompt with new data
//         existingPrompt.prompt = prompt;
//         existingPrompt.tag = tag;

//         await existingPrompt.save();

//         return new Response("Successfully updated the Prompts", { status: 200 });
//     } catch (error) {
//         return new Response("Error Updating Prompt", { status: 500 });
//     }
// };

// export const DELETE = async (request, { params }) => {
//     try {
//         await connectToDB();

//         // Find the prompt by ID and remove it
//         await Prompt.findByIdAndRemove(params.id);

//         return new Response("Prompt deleted successfully", { status: 200 });
//     } catch (error) {
//         return new Response("Error deleting prompt", { status: 500 });
//     }
// };