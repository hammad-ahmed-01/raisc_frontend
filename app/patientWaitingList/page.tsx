"use client";

import { useEffect, useState } from "react";
import { WaitingList } from "./components/WaitingList";
import type { Patient } from "@/src/types";
import TopRightIcons from "@/components/TopRightIcons";
import * as XLSX from "xlsx";

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
      "I'm interested in cognitive behavioral therapy. I've heard good things about it.",
      "I can only do evening sessions because of my work schedule.",
      "I've had therapy before and it helped me a lot.",
      "I'm looking for help with anxiety management. It's been getting worse lately.",
      "I think group therapy might be good for me. I want to meet others going through similar things.",
      "I don't have a car, so I'll need help with transportation.",
      "I prefer online sessions if possible. It's more convenient for me.",
      "I need flexible scheduling because my work hours change every week.",
      "This is urgent. I really need to talk to someone as soon as possible.",
      "I need a follow-up from my last consultation. Things haven't improved.",
      "My doctor referred me here. They said you could help.",
      "I need to schedule something soon. I'm really struggling right now.",
      "My situation is complicated. I think I need someone who specializes in trauma.",
      "I have specific preferences for therapy. Can we discuss what would work best?",
      "I need an assessment first before starting any therapy program.",
      "Weekend appointments work best for me. I'm busy during the week.",
      "I have questions about insurance coverage. Can someone help me with that?",
      "I think my family needs therapy together. We're all struggling.",
      "I had good results with therapy before. I'm hoping to continue that progress.",
      "I need someone who understands trauma. I've been through a lot.",
      "I'm interested in mindfulness-based therapy. I've been practicing meditation.",
      "My schedule is really tight. I need someone who can work around my availability.",
      "I prefer one-on-one sessions. I'm not comfortable in groups.",
      "I need a therapist who speaks Urdu. My English isn't very good.",
      "I have mobility issues, so I'll need accommodations for in-person visits.",
      "Online therapy would be perfect for me. I can't leave my house easily.",
      "I can only do evenings. My mornings are completely booked.",
      "I have some cultural concerns I'd like to discuss with the therapist.",
      "I was referred from the emergency room. They said I should see someone immediately.",
      "I'm in crisis right now. I need help immediately.",
      "Mujhe anxiety bohot zyada ho rahi hai. Main kisi se baat karna chahta hoon.",
      "Mere paas car nahi hai, isliye mujhe transport ki zarurat hai.",
      "Main online sessions prefer karunga. Yeh mere liye zyada aasan hai.",
      "Mujhe flexible timing chahiye kyunki mere kaam ke hours har hafte change hote hain.",
      "Yeh bahut zaruri hai. Mujhe jaldi se kisi se baat karni hai.",
      "Mujhe Urdu bolne wale therapist chahiye. Meri English theek nahi hai.",
      "Main pehle bhi therapy kar chuka hoon aur woh helpful thi.",
      "Mujhe weekend appointments chahiye. Week mein main busy rehta hoon.",
      "Mere family ko bhi therapy ki zarurat hai. Hum sab pareshan hain.",
      "Main group therapy mein interested nahi hoon. One-on-one sessions better hain.",
      "Mujhe trauma specialist chahiye. Maine bahut kuch face kiya hai.",
      "Main evening sessions prefer karta hoon kyunki subah main busy rehta hoon.",
      "Mujhe assessment chahiye pehle, phir therapy start kar sakte hain.",
      "Mere doctor ne mujhe yahan refer kiya hai. Unhone kaha aap help kar sakte hain.",
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

