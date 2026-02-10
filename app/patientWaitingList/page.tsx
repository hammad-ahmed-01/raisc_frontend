"use client";

import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { WaitingList } from "./components/WaitingList";
import type { Patient } from "@/src/types";
import TopRightIcons from "@/components/TopRightIcons";

interface WaitingListPatient extends Omit<Patient, "condition" | "extraInfo"> {
  comment?: string;
}

export default function PatientWaitingListPage() {
  const [patients, setPatients] = useState<WaitingListPatient[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper functions
  const toStr = (v: unknown, fallback = ""): string => {
    const s = (v ?? "").toString().trim();
    return s.length ? s : fallback;
  };

  const getRandomAge = (): number => {
    return Math.floor(Math.random() * 13) + 18; // Age between 18-30
  };

  const getRandomGender = (): Patient["gender"] => {
    const genders: Patient["gender"][] = ["Male", "Female", "Other"];
    return genders[Math.floor(Math.random() * genders.length)];
  };

  const getAllComments = (): string[] => {
    return [
      "I wanna be more comfortable in my skin",
      "A friend told me about this.",
      "I've done therapy before and it helped, but I'd like to try this kinda approach too.",
      "I'm struggling with anxiety but i am too broke for therapy, lets see here",
      "I wonder if there will be group therapy",
      "I'd prefer online therapy sessions, so lets see about raisc",
      "My work schedule changes a lot, so I need something flexible.",
      "Sometimes I need to talk to someone without being judged.",
      "My doctor referred me here and said this could be a good fit.",
      "I'm not doing well and would like to schedule a tele-session",
      "My situation is complicated, and I think I need someone.",
      "I have a few preferences for therapy and ive heard RAISC will have multiple options",
      "Im not sure how to approach therapy, ive heard raisc has a feature to help me find the right direction.",

      "Therapy helped me before, and I'm hoping it can help again, let's see if raisc works for me.",

      "Ive going to therapy for a while, but i cant seem to express myself infront the therapist.",

      "My availability is limited, so flexibility is important for me.",
      "I'm more comfortable with one-on-one sessions than group therapy.",

      "I'd prefer therapy in roman urdu, ive seen psychologists like to use english too",

      "Online therapy would work best since leaving home is difficult for me.",
      "Sometimes i get panic attacks at night",

      "Mujhe bohot zyada anxiety ho rahi hai aur main kisi se baat karna chahta hoon.",
      "Mera system theek krdo bro please.",
      "mera zindagi ka maqsad",
      "Mera schedule har hafte change hota hai, isliye flexibility zaroori hai.",
      "Zindagi ka ajeeb scene chal rha hai, could use help.",

      "Bhai paisay zaya mat karwana please",

      "Weekend mental health kay liye yessirr.",
      "exam stress khtm krwado raisc",
      "apni health kay baray mai sochnay ka time nhi milta boss kia kron",
      "suna hai raisc ka, lets see kia hota"
    ];
  };

  const assignComments = (totalPatients: number): (string | undefined)[] => {
    const allComments = getAllComments();
    const assignedComments: (string | undefined)[] = new Array(totalPatients).fill(undefined);
    
    // Shuffle comments array
    const shuffledComments = [...allComments].sort(() => Math.random() - 0.5);
    
    // Top 15% of users always get comments
    const topUsersThreshold = Math.ceil(totalPatients * 0.15);
    let commentIndex = 0;
    
    // Assign unique comments to top users
    for (let i = 0; i < topUsersThreshold && commentIndex < shuffledComments.length; i++) {
      assignedComments[i] = shuffledComments[commentIndex];
      commentIndex++;
    }
    
    // For remaining users, 25% chance of having a comment
    // But ensure no duplicates
    for (let i = topUsersThreshold; i < totalPatients; i++) {
      if (Math.random() <= 0.25 && commentIndex < shuffledComments.length) {
        assignedComments[i] = shuffledComments[commentIndex];
        commentIndex++;
      }
    }
    
    return assignedComments;
  };

  async function loadPatientsFromExcel() {
    try {
      setLoading(true);
      const response = await fetch("/files/Registered People.xlsx");
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      
      // Get the first sheet
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // Convert to JSON
      const data = XLSX.utils.sheet_to_json(worksheet);
      
      // Extract names from the Excel data
      const names: string[] = [];
      data.forEach((row: any) => {
        // Try common name column names
        const name = 
          toStr(row["Name"]) || 
          toStr(row["name"]) || 
          toStr(row["Full Name"]) || 
          toStr(row["full_name"]) ||
          toStr(row["Patient Name"]) ||
          toStr(row["patient_name"]) ||
          toStr(row[Object.keys(row)[0]]); // Fallback to first column
        
        if (name && name.length > 0) {
          names.push(name);
        }
      });

      // Assign comments ensuring no duplicates
      const assignedComments = assignComments(names.length);
      
      // Create patient objects with random age, gender, and optional comments
      const mapped: WaitingListPatient[] = names.map((name, index) => ({
        id: `waiting-${index + 1}`,
        name,
        age: getRandomAge(),
        gender: getRandomGender(), // Still generated for type compatibility but not displayed
        comment: assignedComments[index],
      }));

      setPatients(mapped);
    } catch (e) {
      console.error("Failed to load patients from Excel:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPatientsFromExcel();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-center text-gray-600">Loading waiting list...</p>
      </div>
    );
  }

  return (
    <main
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/bg/mypatientsbg.png')" }}
    >
      <div className="backdrop-blur-sm bg-blue-50/40 min-h-screen">
        <TopRightIcons />
        <br />
        <br />
        <WaitingList patients={patients} />
      </div>
    </main>
  );
}

