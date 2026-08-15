export const DEALER = {
  name: "Drive Right Motors",
  address: "1649 SW 27th St, Miami, FL",
  addressLines: ["1649 SW 27th St", "Miami, FL"] as const,
  phone: {
    display: "(786) 788-7879",
    href: "tel:+17867887879",
  },
  hours: [
    { day: "Mon – Fri", time: "10 AM – 8 PM" },
    { day: "Saturday", time: "11 AM – 4 PM" },
    { day: "Sunday", time: "Closed" },
  ],
  mapEmbedUrl:
    "https://www.google.com/maps?q=1649+SW+27th+St+Miami+FL&output=embed",
  directionsUrl:
    "https://www.google.com/maps/dir/?api=1&destination=1649+SW+27th+St+Miami+FL",
} as const;
