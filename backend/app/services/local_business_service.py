import httpx
import re
import logging
from typing import Optional, List, Dict, Any
from urllib.parse import urlparse
import asyncio

logger = logging.getLogger(__name__)

class LocalBusinessService:
    def __init__(self):
        self.population_api = "https://datausa.io/api/data"
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
    
    def extract_location(self, idea: str) -> Optional[Dict[str, str]]:
        """Extract city and state from business idea description."""
        us_states = {
            'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR',
            'california': 'CA', 'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE',
            'florida': 'FL', 'georgia': 'GA', 'hawaii': 'HI', 'idaho': 'ID',
            'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA', 'kansas': 'KS',
            'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
            'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS',
            'missouri': 'MO', 'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV',
            'new hampshire': 'NH', 'new jersey': 'NJ', 'new mexico': 'NM', 'new york': 'NY',
            'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH', 'oklahoma': 'OK',
            'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
            'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT',
            'vermont': 'VT', 'virginia': 'VA', 'washington': 'WA', 'west virginia': 'WV',
            'wisconsin': 'WI', 'wyoming': 'WY'
        }
        state_abbrevs = list(us_states.values())
        
        idea_lower = idea.lower()
        
        patterns = [
            r'in\s+([A-Za-z\s]+),?\s*([A-Z]{2})\b',
            r'([A-Za-z\s]+),\s*([A-Z]{2})\b',
            r'(?:based in|located in|serving)\s+([A-Za-z\s]+)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, idea, re.IGNORECASE)
            if match:
                groups = match.groups()
                if len(groups) >= 2:
                    city = groups[0].strip()
                    state = groups[1].upper()
                    if state in state_abbrevs:
                        return {"city": city, "state": state}
                elif len(groups) == 1:
                    city = groups[0].strip()
                    for state_name, abbrev in us_states.items():
                        if state_name in idea_lower:
                            return {"city": city, "state": abbrev}
        
        for state_name, abbrev in us_states.items():
            if state_name in idea_lower:
                city_match = re.search(r'in\s+([A-Za-z]+)', idea, re.IGNORECASE)
                if city_match:
                    return {"city": city_match.group(1), "state": abbrev}
        
        return None
    
    def extract_urls(self, idea: str) -> List[str]:
        """Extract competitor URLs from the business idea description."""
        url_pattern = r'https?://[^\s<>"{}|\\^`\[\]]+'
        urls = re.findall(url_pattern, idea)
        
        domain_pattern = r'\b(?:www\.)?([a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?)\b'
        domains = re.findall(domain_pattern, idea)
        
        for domain in domains:
            if not any(domain in url for url in urls):
                urls.append(f"https://{domain}")
        
        return list(set(urls))[:5]
    
    async def get_population_data(self, location: Dict[str, str]) -> Optional[Dict[str, Any]]:
        """Get population data for a location using Data USA API."""
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.get(
                    self.population_api,
                    params={
                        "drilldowns": "State",
                        "measures": "Population",
                        "year": "latest"
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    state_populations = {
                        item.get("Slug State", "").lower(): item.get("Population", 0)
                        for item in data.get("data", [])
                    }
                    
                    state_name_map = {
                        'AL': 'alabama', 'AK': 'alaska', 'AZ': 'arizona', 'AR': 'arkansas',
                        'CA': 'california', 'CO': 'colorado', 'CT': 'connecticut', 'DE': 'delaware',
                        'FL': 'florida', 'GA': 'georgia', 'HI': 'hawaii', 'ID': 'idaho',
                        'IL': 'illinois', 'IN': 'indiana', 'IA': 'iowa', 'KS': 'kansas',
                        'KY': 'kentucky', 'LA': 'louisiana', 'ME': 'maine', 'MD': 'maryland',
                        'MA': 'massachusetts', 'MI': 'michigan', 'MN': 'minnesota', 'MS': 'mississippi',
                        'MO': 'missouri', 'MT': 'montana', 'NE': 'nebraska', 'NV': 'nevada',
                        'NH': 'new-hampshire', 'NJ': 'new-jersey', 'NM': 'new-mexico', 'NY': 'new-york',
                        'NC': 'north-carolina', 'ND': 'north-dakota', 'OH': 'ohio', 'OK': 'oklahoma',
                        'OR': 'oregon', 'PA': 'pennsylvania', 'RI': 'rhode-island', 'SC': 'south-carolina',
                        'SD': 'south-dakota', 'TN': 'tennessee', 'TX': 'texas', 'UT': 'utah',
                        'VT': 'vermont', 'VA': 'virginia', 'WA': 'washington', 'WV': 'west-virginia',
                        'WI': 'wisconsin', 'WY': 'wyoming'
                    }
                    
                    state_slug = state_name_map.get(location["state"], "").lower()
                    state_pop = 0
                    
                    for item in data.get("data", []):
                        item_state = item.get("State", "").lower().replace(" ", "-")
                        if state_slug in item_state or item_state in state_slug:
                            state_pop = item.get("Population", 0)
                            break
                    
                    us_city_populations = {
                        "new york": 8336817, "los angeles": 3979576, "chicago": 2693976,
                        "houston": 2320268, "phoenix": 1680992, "philadelphia": 1584064,
                        "san antonio": 1547253, "san diego": 1423851, "dallas": 1304379,
                        "san jose": 1013240, "austin": 978908, "jacksonville": 954614,
                        "fort worth": 918915, "columbus": 905748, "charlotte": 874579,
                        "san francisco": 873965, "indianapolis": 867125, "seattle": 753675,
                        "denver": 715522, "washington": 689545, "boston": 675647,
                        "el paso": 678815, "nashville": 689447, "detroit": 639111,
                        "oklahoma city": 681054, "portland": 652503, "las vegas": 641903,
                        "memphis": 633104, "louisville": 617638, "baltimore": 585708,
                        "milwaukee": 577222, "albuquerque": 564559, "tucson": 542629,
                        "fresno": 542107, "mesa": 504258, "sacramento": 524943,
                        "atlanta": 498715, "kansas city": 508090, "colorado springs": 478961,
                        "miami": 449514, "raleigh": 467665, "omaha": 486051,
                        "long beach": 466742, "virginia beach": 459470, "oakland": 433031,
                        "minneapolis": 429954, "tulsa": 413066, "arlington": 394266,
                        "tampa": 384959, "new orleans": 383997, "wichita": 397532,
                        "cleveland": 372624, "bakersfield": 403455, "aurora": 386261,
                        "anaheim": 350365, "honolulu": 350964, "santa ana": 309441,
                        "riverside": 314998, "corpus christi": 317863, "lexington": 322570,
                        "henderson": 320189, "stockton": 320804, "saint paul": 311527,
                        "cincinnati": 309317, "st. louis": 301578, "pittsburgh": 302971,
                        "greensboro": 299035, "anchorage": 291247, "plano": 287677,
                        "lincoln": 291082, "orlando": 307573, "irvine": 307670,
                        "newark": 311549, "toledo": 270871, "durham": 283506,
                        "chula vista": 275487, "fort wayne": 263886, "jersey city": 292449,
                        "st. petersburg": 265351, "laredo": 255473, "madison": 269840,
                        "chandler": 275987, "buffalo": 278349, "lubbock": 263930,
                        "scottsdale": 241361, "reno": 264165, "glendale": 248325,
                        "gilbert": 267918, "winston-salem": 249545, "north las vegas": 262527,
                        "norfolk": 238005, "chesapeake": 249422, "garland": 239928,
                        "irving": 256684, "hialeah": 223109, "fremont": 230504,
                        "boise": 235684, "richmond": 226610, "baton rouge": 227470,
                        "spokane": 228989, "des moines": 214237, "tacoma": 219346,
                        "san bernardino": 222101, "modesto": 218464, "fontana": 214547,
                        "santa clarita": 228673, "moreno valley": 212751, "fayetteville": 211657,
                        "birmingham": 200733, "oxnard": 202063, "rochester": 211328,
                        "port st. lucie": 204851, "grand rapids": 198917, "huntsville": 215006,
                        "salt lake city": 199723, "frisco": 200509, "yonkers": 211569,
                        "glendale": 196021, "huntington beach": 198711, "mckinney": 195308,
                        "montgomery": 200603, "augusta": 202081, "amarillo": 200393,
                        "little rock": 202591, "akron": 190469, "columbus": 195769,
                        "shreveport": 187112, "grand prairie": 196100, "overland park": 197238,
                        "tallahassee": 196169, "mobile": 187041, "knoxville": 190740,
                        "worcester": 206518, "tempe": 180587, "cape coral": 194016,
                        "providence": 190934, "fort lauderdale": 182760, "chattanooga": 181099,
                        "oceanside": 175742, "garden grove": 172646, "rancho cucamonga": 177751,
                        "santa rosa": 178127, "vancouver": 190915, "sioux falls": 192517,
                        "ontario": 175265, "elk grove": 176124, "salem": 175535,
                        "cary": 174721, "eugene": 176654, "palmdale": 169450,
                        "springfield": 169176, "peoria": 170219, "pembroke pines": 171178,
                        "corona": 157136, "lakewood": 155984, "clarksville": 166722,
                        "hayward": 162954, "alexandria": 159467, "salinas": 163542,
                        "lancaster": 173516, "pasadena": 138699, "sunnyvale": 155805,
                        "macon": 157346, "pomona": 151713, "hollywood": 153067,
                        "escondido": 151038, "kansas city": 153014, "joliet": 150362,
                        "naperville": 149540, "torrance": 145014, "bridgeport": 148654,
                        "paterson": 159732, "murfreesboro": 152769, "roseville": 147773,
                        "surprise": 143148, "denton": 139869, "killeen": 153095
                    }
                    
                    city_lower = location["city"].lower()
                    city_pop = us_city_populations.get(city_lower, 75000)
                    
                    if state_pop > 0:
                        if state_pop > 20000000:
                            city_pop = max(city_pop, 150000)
                        elif state_pop > 10000000:
                            city_pop = max(city_pop, 100000)
                    
                    return {
                        "city": location["city"],
                        "state": location["state"],
                        "city_population": city_pop,
                        "state_population": state_pop,
                        "metro_population": city_pop * 2.5,
                        "source": "Data USA / Census estimates"
                    }
                    
        except Exception as e:
            logger.error(f"Error fetching population data: {e}")
        
        return {
            "city": location["city"],
            "state": location["state"],
            "city_population": 75000,
            "state_population": 5000000,
            "metro_population": 187500,
            "source": "Estimated (API unavailable)"
        }
    
    def _get_known_cities(self) -> set:
        """Return set of known US city names for validation."""
        return {
            "new york", "los angeles", "chicago", "houston", "phoenix", "philadelphia",
            "san antonio", "san diego", "dallas", "san jose", "austin", "jacksonville",
            "fort worth", "columbus", "charlotte", "san francisco", "indianapolis", "seattle",
            "denver", "washington", "boston", "el paso", "nashville", "detroit",
            "oklahoma city", "portland", "las vegas", "memphis", "louisville", "baltimore",
            "milwaukee", "albuquerque", "tucson", "fresno", "mesa", "sacramento",
            "atlanta", "kansas city", "colorado springs", "miami", "raleigh", "omaha",
            "long beach", "virginia beach", "oakland", "minneapolis", "tulsa", "arlington",
            "tampa", "new orleans", "wichita", "cleveland", "bakersfield", "aurora",
            "anaheim", "honolulu", "santa ana", "riverside", "corpus christi", "lexington",
            "henderson", "stockton", "saint paul", "cincinnati", "st. louis", "pittsburgh",
            "greensboro", "anchorage", "plano", "lincoln", "orlando", "irvine",
            "newark", "toledo", "durham", "chula vista", "fort wayne", "jersey city",
            "st. petersburg", "laredo", "madison", "chandler", "buffalo", "lubbock",
            "scottsdale", "reno", "glendale", "gilbert", "winston-salem", "north las vegas",
            "norfolk", "chesapeake", "garland", "irving", "hialeah", "fremont",
            "boise", "richmond", "baton rouge", "spokane", "des moines", "tacoma",
            "san bernardino", "modesto", "fontana", "santa clarita", "moreno valley", "fayetteville",
            "birmingham", "oxnard", "rochester", "port st. lucie", "grand rapids", "huntsville",
            "salt lake city", "frisco", "yonkers", "huntington beach", "mckinney",
            "montgomery", "augusta", "amarillo", "little rock", "akron",
            "shreveport", "grand prairie", "overland park", "tallahassee", "mobile", "knoxville",
            "worcester", "tempe", "cape coral", "providence", "fort lauderdale", "chattanooga",
            "oceanside", "garden grove", "rancho cucamonga", "santa rosa", "vancouver", "sioux falls",
            "ontario", "elk grove", "salem", "cary", "eugene", "palmdale",
            "springfield", "peoria", "pembroke pines", "corona", "lakewood", "clarksville",
            "hayward", "alexandria", "salinas", "lancaster", "pasadena", "sunnyvale",
            "macon", "pomona", "hollywood", "escondido", "joliet", "naperville",
            "torrance", "bridgeport", "paterson", "murfreesboro", "roseville",
            "surprise", "denton", "killeen"
        }

    def _is_safe_url(self, url: str) -> bool:
        """Validate URL is safe to scrape (prevent SSRF)."""
        try:
            parsed = urlparse(url)
            if not parsed.scheme in ('http', 'https'):
                return False
            if not parsed.netloc:
                return False
            
            blocked_patterns = [
                'localhost', '127.0.0.1', '0.0.0.0', '::1',
                '10.', '172.16.', '172.17.', '172.18.', '172.19.',
                '172.20.', '172.21.', '172.22.', '172.23.', '172.24.',
                '172.25.', '172.26.', '172.27.', '172.28.', '172.29.',
                '172.30.', '172.31.', '192.168.', '169.254.',
                '.internal', '.local', 'metadata.google', 
                'instance-data', '.amazonaws.com/latest'
            ]
            
            host = parsed.netloc.lower()
            for pattern in blocked_patterns:
                if pattern in host:
                    return False
            
            return True
        except Exception:
            return False

    async def scrape_competitor_website(self, url: str) -> Optional[Dict[str, Any]]:
        """Scrape a competitor website for business intelligence."""
        parsed = urlparse(url)
        domain = parsed.netloc or parsed.path.split('/')[0]
        
        if not self._is_safe_url(url):
            logger.warning(f"Blocked unsafe URL: {url}")
            return {"url": url, "domain": domain, "error": "URL blocked for security"}
        
        try:
            async with httpx.AsyncClient(timeout=10.0, follow_redirects=False, max_redirects=0) as client:
                response = await client.get(url, headers=self.headers)
                
                if response.status_code != 200:
                    return {"url": url, "domain": domain, "error": f"HTTP {response.status_code}"}
                
                html = response.text
                
                title_match = re.search(r'<title[^>]*>([^<]+)</title>', html, re.IGNORECASE)
                title = title_match.group(1).strip() if title_match else domain
                
                desc_match = re.search(r'<meta[^>]*name=["\']description["\'][^>]*content=["\']([^"\']+)["\']', html, re.IGNORECASE)
                if not desc_match:
                    desc_match = re.search(r'<meta[^>]*content=["\']([^"\']+)["\'][^>]*name=["\']description["\']', html, re.IGNORECASE)
                description = desc_match.group(1).strip() if desc_match else ""
                
                price_patterns = [
                    r'\$\s*(\d{1,6}(?:,\d{3})*(?:\.\d{2})?)',
                    r'(\d{1,6}(?:,\d{3})*(?:\.\d{2})?)\s*(?:USD|dollars?)',
                    r'(?:price|cost|fee|rate)[:\s]*\$?\s*(\d{1,6}(?:,\d{3})*(?:\.\d{2})?)',
                ]
                prices = []
                for pattern in price_patterns:
                    found = re.findall(pattern, html, re.IGNORECASE)
                    for p in found:
                        try:
                            price_val = float(p.replace(',', ''))
                            if 1 <= price_val <= 100000:
                                prices.append(price_val)
                        except:
                            pass
                
                prices = list(set(prices))[:10]
                
                service_patterns = [
                    r'<h[1-3][^>]*>([^<]{5,100})</h[1-3]>',
                    r'class=["\'][^"\']*service[^"\']*["\'][^>]*>([^<]{5,100})<',
                ]
                services = []
                for pattern in service_patterns[:1]:
                    found = re.findall(pattern, html, re.IGNORECASE)
                    services.extend([s.strip() for s in found if len(s.strip()) > 3])
                services = list(set(services))[:8]
                
                has_booking = bool(re.search(r'book|schedule|appointment|reserve|calendar', html, re.IGNORECASE))
                has_contact = bool(re.search(r'contact|call|email|phone|\(\d{3}\)', html, re.IGNORECASE))
                has_reviews = bool(re.search(r'review|testimonial|rating|stars?|feedback', html, re.IGNORECASE))
                has_pricing_page = bool(re.search(r'pricing|prices|rates|cost|fee', html, re.IGNORECASE))
                
                phone_match = re.search(r'\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', html)
                phone = phone_match.group(0) if phone_match else None
                
                email_match = re.search(r'[\w.+-]+@[\w-]+\.[\w.-]+', html)
                email = email_match.group(0) if email_match else None
                
                return {
                    "url": url,
                    "domain": domain,
                    "title": title,
                    "description": description[:300] if description else None,
                    "prices_found": prices,
                    "price_range": {"min": min(prices), "max": max(prices)} if prices else None,
                    "services_mentioned": services[:5],
                    "features": {
                        "has_online_booking": has_booking,
                        "has_contact_info": has_contact,
                        "shows_reviews": has_reviews,
                        "has_pricing_page": has_pricing_page
                    },
                    "contact": {
                        "phone": phone,
                        "email": email
                    }
                }
                
        except httpx.TimeoutException:
            parsed_url = urlparse(url)
            return {"url": url, "domain": parsed_url.netloc or url, "error": "Timeout"}
        except Exception as e:
            logger.error(f"Error scraping {url}: {e}")
            return {"url": url, "error": str(e)}
    
    async def analyze_local_business(self, idea: str) -> Dict[str, Any]:
        """Analyze a local business idea with population data and competitor scraping."""
        result = {
            "is_local_business": False,
            "location": None,
            "location_confidence": "none",
            "population_data": None,
            "competitors_analyzed": [],
            "market_insights": None
        }
        
        location = self.extract_location(idea)
        if location:
            city_lower = location["city"].lower()
            known_cities = self._get_known_cities()
            
            if city_lower in known_cities:
                result["location_confidence"] = "high"
                result["is_local_business"] = True
            else:
                result["location_confidence"] = "estimated"
                result["is_local_business"] = True
            
            result["location"] = location
            
            population_data = await self.get_population_data(location)
            result["population_data"] = population_data
            
            if population_data:
                city_pop = population_data.get("city_population", 75000)
                metro_pop = population_data.get("metro_population", city_pop * 2.5)
                
                household_size = 2.5
                households = city_pop / household_size
                
                result["market_insights"] = {
                    "total_households": int(households),
                    "metro_households": int(metro_pop / household_size),
                    "tam_calculation_base": {
                        "city_population": city_pop,
                        "metro_population": int(metro_pop),
                        "households": int(households),
                        "working_adults": int(city_pop * 0.65),
                        "median_household_income_estimate": 65000
                    }
                }
        
        competitor_urls = self.extract_urls(idea)
        if competitor_urls:
            tasks = [self.scrape_competitor_website(url) for url in competitor_urls]
            competitors = await asyncio.gather(*tasks)
            result["competitors_analyzed"] = [c for c in competitors if c]
            
            if result["competitors_analyzed"]:
                all_prices = []
                features_count = {"booking": 0, "reviews": 0, "pricing": 0}
                
                for comp in result["competitors_analyzed"]:
                    if comp.get("prices_found"):
                        all_prices.extend(comp["prices_found"])
                    features = comp.get("features", {})
                    if features.get("has_online_booking"):
                        features_count["booking"] += 1
                    if features.get("shows_reviews"):
                        features_count["reviews"] += 1
                    if features.get("has_pricing_page"):
                        features_count["pricing"] += 1
                
                result["competitor_summary"] = {
                    "count": len(result["competitors_analyzed"]),
                    "avg_price": sum(all_prices) / len(all_prices) if all_prices else None,
                    "price_range": {"min": min(all_prices), "max": max(all_prices)} if all_prices else None,
                    "pct_with_online_booking": features_count["booking"] / len(result["competitors_analyzed"]) * 100,
                    "pct_showing_reviews": features_count["reviews"] / len(result["competitors_analyzed"]) * 100,
                    "pct_with_pricing": features_count["pricing"] / len(result["competitors_analyzed"]) * 100,
                    "market_gaps": []
                }
                
                if features_count["booking"] < len(result["competitors_analyzed"]) * 0.5:
                    result["competitor_summary"]["market_gaps"].append("Online booking is underutilized - opportunity for convenience")
                if features_count["reviews"] < len(result["competitors_analyzed"]) * 0.5:
                    result["competitor_summary"]["market_gaps"].append("Few competitors showcase reviews - opportunity for social proof")
                if not all_prices:
                    result["competitor_summary"]["market_gaps"].append("Pricing is opaque - opportunity for transparent pricing")
        
        return result


local_business_service = LocalBusinessService()
