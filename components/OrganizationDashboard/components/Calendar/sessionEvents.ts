import { add } from "date-fns";

const selectedDate = new Date(2025, 5, 24); // June 24, 2025

const sessionColors: Record<string, string> = {
  "Dr. Ali Hamza": "#F99B9B",
  "Dr. Alisha": "#F9C78B",
  "Dr. Sara Ali": "#B3F99B",
  "Dr. Zahra": "#E7A7F9",
};

const events = [
  {
    title: "Dr. Ali Hamza",
    doctor: "Dr. Ali Hamza",
    therapy: "Cognitive Therapy",
    start: selectedDate,
    end: add(selectedDate, { hours: 1 }),
    color: sessionColors["Dr. Ali Hamza"],
  },
  {
    title: "Dr. Alisha",
    doctor: "Dr. Alisha",
    therapy: "Cognitive Therapy",
    start: add(selectedDate, { hours: 2 }),
    end: add(selectedDate, { hours: 3 }),
    color: sessionColors["Dr. Alisha"],
  },
  {
    title: "Dr. Sara Ali",
    doctor: "Dr. Sara Ali",
    therapy: "Cognitive Therapy",
    start: add(selectedDate, { hours: 4 }),
    end: add(selectedDate, { hours: 5 }),
    color: sessionColors["Dr. Sara Ali"],
  },
  {
    title: "Dr. Zahra",
    doctor: "Dr. Zahra",
    therapy: "Cognitive Therapy",
    start: add(selectedDate, { hours: 6 }),
    end: add(selectedDate, { hours: 7 }),
    color: sessionColors["Dr. Zahra"],
  },
];

export { selectedDate, sessionColors, events };
