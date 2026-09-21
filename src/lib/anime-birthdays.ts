export interface AnimeBirthday {
  name: string;
  anime: string;
  month: number; // 1-12
  day: number; // 1-31
  color?: string;
}

// Curated official character birthdays (as sourced from AniList/MAL profiles)
export const ANIME_BIRTHDAYS: AnimeBirthday[] = [
  { name: "Naruto Uzumaki", anime: "Naruto", month: 10, day: 10, color: "#ff9933" },
  { name: "Sasuke Uchiha", anime: "Naruto", month: 7, day: 23, color: "#7b4bd4" },
  { name: "Sakura Haruno", anime: "Naruto", month: 3, day: 28, color: "#ff6b8a" },
  { name: "Kakashi Hatake", anime: "Naruto", month: 9, day: 15, color: "#9aa7b1" },
  { name: "Hinata Hyuga", anime: "Naruto", month: 12, day: 27, color: "#c9a7d4" },
  { name: "Itachi Uchiha", anime: "Naruto", month: 6, day: 9, color: "#4d1f6b" },
  { name: "Jiraiya", anime: "Naruto", month: 11, day: 11, color: "#e8e0d8" },
  { name: "Shikamaru Nara", anime: "Naruto", month: 7, day: 23, color: "#3d6b35" },
  { name: "Rock Lee", anime: "Naruto", month: 11, day: 27, color: "#4a9d3f" },
  { name: "Gaara", anime: "Naruto", month: 1, day: 19, color: "#c44d2f" },
  { name: "Monkey D. Luffy", anime: "One Piece", month: 5, day: 5, color: "#e01f26" },
  { name: "Roronoa Zoro", anime: "One Piece", month: 11, day: 11, color: "#3fae49" },
  { name: "Nami", anime: "One Piece", month: 7, day: 3, color: "#ff9c28" },
  { name: "Usopp", anime: "One Piece", month: 4, day: 1, color: "#b8860b" },
  { name: "Sanji", anime: "One Piece", month: 3, day: 2, color: "#e6c300" },
  { name: "Tony Tony Chopper", anime: "One Piece", month: 12, day: 24, color: "#d26fa2" },
  { name: "Nico Robin", anime: "One Piece", month: 2, day: 6, color: "#5a4e8f" },
  { name: "Franky", anime: "One Piece", month: 3, day: 9, color: "#2b7fd6" },
  { name: "Brook", anime: "One Piece", month: 4, day: 3, color: "#7f8c8d" },
  { name: "Goku", anime: "Dragon Ball", month: 4, day: 16, color: "#ff8c00" },
  { name: "Bulma", anime: "Dragon Ball", month: 8, day: 18, color: "#00c2d1" },
  { name: "Vegeta", anime: "Dragon Ball", month: 1, day: 28, color: "#5a7d8a" },
  { name: "Tanjiro Kamado", anime: "Demon Slayer", month: 7, day: 14, color: "#2f8f5b" },
  { name: "Nezuko Kamado", anime: "Demon Slayer", month: 12, day: 28, color: "#ffb6c1" },
  { name: "Zenitsu Agatsuma", anime: "Demon Slayer", month: 9, day: 3, color: "#ffd54f" },
  { name: "Inosuke Hashibira", anime: "Demon Slayer", month: 4, day: 22, color: "#4b8bbe" },
  { name: "Eren Yeager", anime: "Attack on Titan", month: 3, day: 30, color: "#6f7d5c" },
  { name: "Mikasa Ackerman", anime: "Attack on Titan", month: 2, day: 10, color: "#b23a48" },
  { name: "Armin Arlert", anime: "Attack on Titan", month: 11, day: 3, color: "#e0a458" },
  { name: "Levi Ackerman", anime: "Attack on Titan", month: 12, day: 25, color: "#8a8f98" },
  { name: "Erwin Smith", anime: "Attack on Titan", month: 10, day: 14, color: "#5f7a8a" },
  { name: "Satoru Gojo", anime: "Jujutsu Kaisen", month: 12, day: 7, color: "#6ab0e8" },
  { name: "Yuji Itadori", anime: "Jujutsu Kaisen", month: 3, day: 20, color: "#e08a8a" },
  { name: "Megumi Fushiguro", anime: "Jujutsu Kaisen", month: 12, day: 3, color: "#5f7a8a" },
  { name: "Nobara Kugisaki", anime: "Jujutsu Kaisen", month: 8, day: 7, color: "#e8c45a" },
  { name: "Izuku Midoriya", anime: "My Hero Academia", month: 7, day: 15, color: "#2fbf71" },
  { name: "Katsuki Bakugo", anime: "My Hero Academia", month: 4, day: 20, color: "#ff9300" },
  { name: "Shoto Todoroki", anime: "My Hero Academia", month: 1, day: 11, color: "#d44a4a" },
  { name: "Ichigo Kurosaki", anime: "Bleach", month: 7, day: 15, color: "#e8743b" },
  { name: "Rukia Kuchiki", anime: "Bleach", month: 1, day: 14, color: "#7b8fd4" },
  { name: "Gon Freecss", anime: "Hunter x Hunter", month: 5, day: 5, color: "#3fae49" },
  { name: "Killua Zoldyck", anime: "Hunter x Hunter", month: 7, day: 7, color: "#c9c9ff" },
  { name: "Kurapika", anime: "Hunter x Hunter", month: 9, day: 4, color: "#a4521d" },
  { name: "Edward Elric", anime: "Fullmetal Alchemist", month: 2, day: 3, color: "#c94f2f" },
  { name: "Light Yagami", anime: "Death Note", month: 2, day: 28, color: "#3b3b3b" },
  { name: "L", anime: "Death Note", month: 10, day: 31, color: "#b8b8b8" },
  { name: "Lelouch Lamperouge", anime: "Code Geass", month: 12, day: 5, color: "#2e2e3a" },
  { name: "Kirito", anime: "Sword Art Online", month: 10, day: 7, color: "#2d5fb8" },
  { name: "Asuna Yuuki", anime: "Sword Art Online", month: 9, day: 30, color: "#f28fb2" },
  { name: "Ash Ketchum", anime: "Pokémon", month: 5, day: 22, color: "#e01f26" },
  { name: "Pikachu", anime: "Pokémon", month: 2, day: 27, color: "#ffd54f" },
  { name: "Shin-chan Nohara", anime: "Crayon Shin-chan", month: 5, day: 5, color: "#e01f26" },
  { name: "Doraemon", anime: "Doraemon", month: 9, day: 3, color: "#2b7fd6" },
  { name: "Detective Conan / Shinichi Kudo", anime: "Detective Conan", month: 5, day: 4, color: "#2b7fd6" },
];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function birthdaysOn(month: number, day: number): AnimeBirthday[] {
  return ANIME_BIRTHDAYS.filter((b) => b.month === month && b.day === day);
}

export function upcomingBirthdays(from: Date, days = 7): { birthday: AnimeBirthday; date: Date }[] {
  const out: { birthday: AnimeBirthday; date: Date }[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i, 12);
    for (const b of birthdaysOn(d.getMonth() + 1, d.getDate())) {
      out.push({ birthday: b, date: d });
    }
  }
  return out;
}

export function monthAlphabet(of: Date): string {
  return MONTHS[of.getMonth()];
}

export function dayLabel(d: Date): string {
  return `${DAYS_OF_WEEK[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function monthName(m: number): string {
  return MONTHS[m - 1];
}

export const BIRTHDAY_MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);