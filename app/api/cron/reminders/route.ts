import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin securely
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // The private key must handle newlines if loaded from an environment variable
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error('Firebase Admin init error', error);
  }
}

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: Request) {
  // Authorization check to ensure only Vercel Cron can trigger this (optional in dev)
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Pre-flight check: Make sure the user has added their Firebase Admin keys
  if (!process.env.FIREBASE_PRIVATE_KEY) {
    return NextResponse.json(
      { error: "Missing FIREBASE_PRIVATE_KEY in .env.local. Please add your Firebase Service Account keys." }, 
      { status: 500 }
    );
  }

  try {
    const db = admin.firestore();
    const usersRef = db.collection('users');
    
    // Fetch all users who have the daily reminder enabled
    const snapshot = await usersRef.where('preferences.reminderEnabled', '==', true).get();

    if (snapshot.empty) {
      return NextResponse.json({ message: "No users currently have reminders enabled." });
    }

    const emailsToSend: any[] = [];
    
    // In a fully production app, we would only send to users whose `reminderTime` 
    // matches the current hour. For demonstration purposes, we will batch them here.
    const currentHour = new Date().getHours();

    snapshot.forEach(doc => {
      const user = doc.data();
      
      // Vercel servers run in UTC. For a true production app, you would 
      // convert the user's local preferredHour to UTC based on their timezone.
      const preferredHour = parseInt(user.preferences?.reminderTime?.split(':')[0] || "20");
      
      // STRICT CHECK: Only send if the current UTC hour matches their preferred hour.
      if (preferredHour !== currentHour) {
        return; // acts as 'continue' in forEach
      }

      // Check if user already made an entry today
      if (user.lastEntryDate) {
        const lastDate = user.lastEntryDate.toDate();
        const now = new Date();
        const isSameDay = 
          lastDate.getFullYear() === now.getFullYear() &&
          lastDate.getMonth() === now.getMonth() &&
          lastDate.getDate() === now.getDate();
        
        if (isSameDay) {
          // User already made an entry today, skip sending!
          return;
        }
      }

      if (user.email) {
        emailsToSend.push({
          from: 'Feel App <onboarding@resend.dev>', // Resend requires this specific from-address on the free tier
          to: user.email,
          subject: '🌿 Time for your Daily Journal Entry!',
          html: `
            <div style="font-family: sans-serif; text-align: center; padding: 32px; background-color: #f8fafc; border-radius: 12px;">
              <h2 style="color: #0f172a;">Good day, ${user.displayName || 'Friend'}!</h2>
              <p style="color: #475569; font-size: 16px;">Just a quick reminder to take a moment and reflect on your day.</p>
              <p style="color: #475569; font-size: 16px; margin-bottom: 32px;">Log into <strong>Feel</strong> and write one honest line to keep your streak alive!</p>
              
              <a href="http://localhost:3000/dashboard" style="background-color: #22c55e; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                Write Today's Entry
              </a>
              
              <p style="margin-top: 40px; font-size: 12px; color: #94a3b8;">
                You can change your reminder settings anytime in the Feel App Preferences.
              </p>
            </div>
          `
        });
      }
    });

    if (emailsToSend.length > 0) {
      // Resend Batch API has a limit of 100 emails per request.
      // For production safety, we chunk the array into batches of 100.
      const BATCH_SIZE = 100;
      const results = [];
      
      for (let i = 0; i < emailsToSend.length; i += BATCH_SIZE) {
        const chunk = emailsToSend.slice(i, i + BATCH_SIZE);
        const result = await resend.batch.send(chunk);
        results.push(result);
      }
      
      return NextResponse.json({ success: true, count: emailsToSend.length, results });
    }

    return NextResponse.json({ success: true, count: 0, message: "No users matched the delivery time criteria." });

  } catch (error: any) {
    console.error('Cron job error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
