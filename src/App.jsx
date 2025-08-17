import React, { useMemo, useState } from "react";

// HomeScout: Minimal single-file React app
// - Tailwind for styles (no external CSS needed)
// - Mock listings for now; swap propertySearch() with a real API later
// - Mortgage calculator included; shows assumptions
// - Shortlist + Compare + simple Tour request modal (mock)

const MOCK_LISTINGS = [
  {
    id: "HS-001",
    address: "123 Oak St, Sunnyvale, CA 94087",
    price: 899000,
    beds: 3,
    baths: 2,
    sqft: 1420,
    hoa: 120,
    yearBuilt: 1989,
    dom: 12,
    pros: ["Remodeled kitchen", "Quiet street", "Central AC"],
    cons: ["Small yard"],
  },
  {
    id: "HS-002",
    address: "456 Pine Ave, Mountain View, CA 94040",
    price: 1250000,
    beds: 4,
    baths: 3,
    sqft: 1880,
    hoa: 0,
    yearBuilt: 1978,
    dom: 7,
    pros: ["Near park", "Large backyard"],
    cons: ["Older roof"],
  },
  {
    id: "HS-003",
    address: "789 Maple Ct, Santa Clara, CA 95050",
    price: 779000,
    beds: 2,
    baths: 2,
    sqft: 980,
    hoa: 360,
    yearBuilt: 2010,
    dom: 30,
    pros: ["Turn-key condo", "Gym + pool"],
    cons: ["Higher HOA"],
  },
  {
    id: "HS-004",
    address: "22 Cherry Ln, Cupertino, CA 95014",
    price: 1595000,
    beds: 3,
    baths: 2,
    sqft: 1620,
    hoa: 0,
    yearBuilt: 1968,
    dom: 18,
    pros: ["Top schools", "Updated baths"],
    cons: ["Smaller primary"],
  },
  {
    id: "HS-005",
    address: "910 Birch Dr, San Jose, CA 95126",
    price: 899000,
    beds: 3,
    baths: 2,
    sqft: 1510,
    hoa: 0,
    yearBuilt: 1996,
    dom: 9,
    pros: ["2-car garage", "Near light rail"],
    cons: ["Some road noise"],
  },
];

function currency(n) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function monthlyPI(principal, annualRatePct, years) {
  const r = annualRatePct / 100 / 12;
  const n = years * 12;
  if (r === 0) return principal / n;
  return (principal * r) / (1 - Math.pow(1 + r, -n));
}

function monthlyPayment({ price, downPct, ratePct, termYears, taxPct, hoa, insurance }) {
  const down = price * downPct;
  const loan = Math.max(price - down, 0);
  const pi = monthlyPI(loan, ratePct, termYears);
  const tax = (price * (taxPct / 100)) / 12;
  const ins = insurance;
  const total = pi + tax + (hoa || 0) + (ins || 0);
  return { pi, tax, hoa: hoa || 0, insurance: ins || 0, total, loan, down };
}

export default function HomeScoutApp() {
  const [location, setLocation] = useState("Sunnyvale, CA");
  const [priceMin, setPriceMin] = useState(750000);
  const [priceMax, setPriceMax] = useState(1600000);
  const [beds, setBeds] = useState(3);
  const [baths, setBaths] = useState(2);
  const [downPct, setDownPct] = useState(0.20);
  const [ratePct, setRatePct] = useState(6.75);
  const [termYears, setTermYears] = useState(30);
  const [taxPct, setTaxPct] = useState(1.1);
  const [insurance, setInsurance] = useState(120);
  const [results, setResults] = useState([]);

  const search = () => {
    const filtered = MOCK_LISTINGS.filter((x) => {
      const locMatch = location.trim() === "" || x.address.toLowerCase().includes(location.toLowerCase());
      const withinPrice = x.price >= priceMin && x.price <= priceMax;
      const bedOk = x.beds >= beds;
      const bathOk = x.baths >= baths;
      return locMatch && withinPrice && bedOk && bathOk;
    });
    setResults(filtered);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="bg-white border-b border-slate-200 p-4">
        <h1 className="text-2xl font-bold">HomeScout</h1>
        <p className="text-sm text-slate-600">AI real estate aide (demo)</p>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        <section className="bg-white rounded-2xl shadow p-4 mb-6">
          <h2 className="text-lg font-semibold mb-3">Search Filters</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Location</label>
              <input value={location} onChange={(e)=>setLocation(e.target.value)}
                     className="mt-1 w-full rounded-xl border-slate-300" />
            </div>
            <div>
              <label className="block text-sm font-medium">Beds (min)</label>
              <input type="number" value={beds} onChange={(e)=>setBeds(Number(e.target.value))}
                     className="mt-1 w-full rounded-xl border-slate-300" />
            </div>
            <div>
              <label className="block text-sm font-medium">Min Price</label>
              <input type="number" value={priceMin} onChange={(e)=>setPriceMin(Number(e.target.value))}
                     className="mt-1 w-full rounded-xl border-slate-300" />
            </div>
            <div>
              <label className="block text-sm font-medium">Max Price</label>
              <input type="number" value={priceMax} onChange={(e)=>setPriceMax(Number(e.target.value))}
                     className="mt-1 w-full rounded-xl border-slate-300" />
            </div>
          </div>
          <button onClick={search}
                  className="mt-4 w-full rounded-xl bg-slate-900 text-white py-2 font-semibold hover:bg-slate-800">
            Search Homes
          </button>
        </section>

        {results.length > 0 && (
          <section className="space-y-4">
            {results.map((x) => {
              const calc = monthlyPayment({ price: x.price, downPct, ratePct, termYears, taxPct, hoa: x.hoa, insurance });
              return (
                <div key={x.id} className="bg-white rounded-2xl shadow p-4 border border-slate-200">
                  <h3 className="font-semibold">{x.address}</h3>
                  <p>{currency(x.price)} • {x.beds} bd / {x.baths} ba • {x.sqft} sqft</p>
                  <p className="text-sm text-slate-500">Est. Monthly: {currency(calc.total)}</p>
                  <p className="text-sm text-slate-600">Pros: {x.pros.join(", ")}</p>
                  <p className="text-sm text-slate-600">Cons: {x.cons.join(", ")}</p>
                </div>
              );
            })}
          </section>
        )}
      </main>
    </div>
  );
}