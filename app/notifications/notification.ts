// notification.ts

export type NotificationType = {
  title: string;
  description: string;
  time: string;
  isNew: boolean;
};

export function getNotifications(userType: string): NotificationType[] {
  const timeAgo = (min: number) => `${min} minute${min === 1 ? "" : "s"} ago`;

  if (userType === "doctor") {
    return [
      {
        title: "New Patient Request",
        description: "Sarah Malik requested a session.",
        time: timeAgo(3),
        isNew: true,
      },
      {
        title: "Upcoming Session Reminder",
        description: "Session with Ali at 2:00PM today.",
        time: timeAgo(60),
        isNew: true,
      },
      {
        title: "Session Reschedule",
        description: "Ayesha’s session was rescheduled to July 12.",
        time: timeAgo(240),
        isNew: false,
      },
      {
        title: "Organization Updates",
        description: "PIMH has updated its guidelines.",
        time: timeAgo(720),
        isNew: false,
      },
    ];
  }

  if (userType === "patient") {
    return [
      {
        title: "Upcoming Session Reminder",
        description: "Session with Dr. Ali at 3:00PM today.",
        time: timeAgo(10),
        isNew: true,
      },
      {
        title: "Session Reschedule",
        description: "Your session was moved to August 8.",
        time: timeAgo(90),
        isNew: false,
      },
    ];
  }

  if (userType === "organization") {
    return [
      {
        title: "New Join Request",
        description: "Dr. Alisha requested to join the organization.",
        time: timeAgo(5),
        isNew: true,
      },
      {
        title: "Session Completion Report",
        description: "Today's session summary available.",
        time: timeAgo(120),
        isNew: false,
      },
    ];
  }

  return [];
}
