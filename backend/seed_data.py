import os
import sys
import django

# Setup django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'emergency_assistant.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'apps'))
django.setup()

from apps.knowledge_base.models import EmergencyProtocol
from apps.emergency_contacts.models import EmergencyContact
from apps.locations.models import EmergencyFacility


def seed_knowledge_base():
    print("Seeding verified Emergency Protocols (RAG Knowledge Base)...")
    EmergencyProtocol.objects.all().delete()

    protocols = [
        {
            "category": "accident",
            "title": "Road Traffic Accident & Extrication Response",
            "severity_default": "CRITICAL",
            "source_agency": "WHO & National Highway Traffic Safety Administration (NHTSA)",
            "summary": "Standard operating procedure for vehicle collisions involving passenger injury, entrapment, or highway hazards.",
            "steps": [
                {
                    "number": 1,
                    "title": "Ensure Scene & Traffic Safety",
                    "instruction": "Turn on your vehicle hazard lights. Park at a safe distance back from the wreckage to shield the scene. Place warning reflectors or flares 50 meters back if safe."
                },
                {
                    "number": 2,
                    "title": "Turn Off Vehicle Ignitions",
                    "instruction": "If safe and reachable without entering a crushed cabin, switch off the ignition of all involved vehicles to minimize fuel ignition and fire hazards."
                },
                {
                    "number": 3,
                    "title": "Do NOT Move Trapped Victims",
                    "instruction": "Unless the vehicle is on fire or sinking in water, do NOT move casualties. Immobilize their head and neck in the position found to protect against permanent spinal cord injury."
                },
                {
                    "number": 4,
                    "title": "Control Severe Bleeding",
                    "instruction": "Apply firm, steady pressure directly onto open bleeding wounds using a sterile compress, clean clothing, or pressure bandage."
                },
                {
                    "number": 5,
                    "title": "Maintain Victim Warmth & Calmness",
                    "instruction": "Cover victims with jackets or blankets to prevent trauma-induced hypothermia. Speak in a steady, reassuring tone until rescue crews arrive."
                }
            ],
            "dos": [
                "Call 911 / 112 immediately with mile-markers or intersection names",
                "Keep rubbernecking pedestrians away from highway traffic",
                "Monitor consciousness, pulse, and airway breathing regularly"
            ],
            "donts": [
                "Do NOT remove a motorcycle rider's helmet unless their airway is obstructed",
                "Do NOT attempt to pry crushed vehicle frames without hydraulic tools",
                "Do NOT give oral fluids, food, or medication to injured victims"
            ],
            "keywords": "car accident, vehicle crash, road collision, traffic, overturned, highway, pedestrian struck, trapped, extrication"
        },
        {
            "category": "medical",
            "title": "Adult CPR & Sudden Cardiac Arrest Protocol",
            "severity_default": "CRITICAL",
            "source_agency": "American Heart Association (AHA) & Red Cross",
            "summary": "Immediate resuscitation protocol for individuals found unresponsive and not breathing or only gasping.",
            "steps": [
                {
                    "number": 1,
                    "title": "Verify Unresponsiveness & Dispatch Help",
                    "instruction": "Tap the victim firmly on the collarbones and shout loudly: 'Are you okay?'. If no response and no normal breathing, shout for help and dial 911 / 112 immediately. Order a bystander to locate an Automated External Defibrillator (AED)."
                },
                {
                    "number": 2,
                    "title": "Position on Firm, Flat Surface",
                    "instruction": "Quickly lay the victim on their back on the floor or ground. Kneel beside their chest."
                },
                {
                    "number": 3,
                    "title": "Begin High-Quality Chest Compressions",
                    "instruction": "Place the heel of one hand on the center of the victim's chest (lower half of breastbone). Interlock your other hand on top. Lock elbows straight. Push hard and fast at 100 to 120 compressions per minute (to the beat of 'Stayin Alive') at a depth of 2 to 2.4 inches (5 to 6 cm)."
                },
                {
                    "number": 4,
                    "title": "Allow Full Chest Recoil",
                    "instruction": "Let the chest completely return to its resting position between every compression. Do not lean on the victim."
                },
                {
                    "number": 5,
                    "title": "Deploy AED Immediately Upon Arrival",
                    "instruction": "Open the AED lid, turn it on, and follow the audible voice prompts. Apply pads to bare chest as illustrated. Clear bystanders before the AED delivers a shock."
                }
            ],
            "dos": [
                "Perform continuous hands-only CPR if untrained in rescue breaths",
                "Swap compression rescuers every 2 minutes if tired to maintain depth",
                "Continue until the patient shows signs of life or EMS takes over"
            ],
            "donts": [
                "Do NOT delay compressions to check for a faint pulse if breathing is absent",
                "Do NOT interrupt compressions for more than 10 seconds",
                "Do NOT touch the victim while the AED is analyzing or delivering a shock"
            ],
            "keywords": "cpr, cardiac arrest, heart attack, unconscious, not breathing, collapsed, chest pain, aed, defibrillator"
        },
        {
            "category": "medical",
            "title": "Life-Threatening Bleeding & Hemorrhage Control",
            "severity_default": "CRITICAL",
            "source_agency": "Stop the Bleed & American College of Surgeons",
            "summary": "Guidelines to prevent rapid hemorrhagic shock from deep arterial or venous trauma.",
            "steps": [
                {
                    "number": 1,
                    "title": "Expose Wound & Identify Source",
                    "instruction": "Cut or tear clothing away to find the exact origin of bleeding. Look for spurting, pulsing, or continuous pooling blood."
                },
                {
                    "number": 2,
                    "title": "Apply Relentless Direct Pressure",
                    "instruction": "Place a sterile pad, gauze, or clean shirt directly on the wound. Press down with both hands using your full body weight."
                },
                {
                    "number": 3,
                    "title": "Pack Deep Wounds in Groin or Armpits",
                    "instruction": "If the wound is a deep cavity (junctional area), firmly pack gauze into the wound cavity until full, then hold severe pressure on top for at least 3 continuous minutes."
                },
                {
                    "number": 4,
                    "title": "Deploy Tourniquet for Extremity Bleeding",
                    "instruction": "For severe arm or leg bleeding where pressure is insufficient, place a commercial tourniquet 2 to 3 inches above the wound (never on a joint). Tighten the windlass until the bleeding stops completely and pulse vanishes. Record the exact time applied on the band."
                },
                {
                    "number": 5,
                    "title": "Prevent Shock",
                    "instruction": "Lay victim down, elevate legs if no pelvic/spinal fracture, and cover with warm blanket."
                }
            ],
            "dos": [
                "Call 911 / 112 as the first step",
                "Leave soaked bandages in place; add fresh layers directly over them",
                "Communicate the tourniquet application time to arriving paramedics"
            ],
            "donts": [
                "Do NOT loosen or remove a tourniquet once secured",
                "Do NOT use thin wire, string, or cords as tourniquets (tissue damage)",
                "Do NOT probe inside the wound with fingers to extract embedded foreign objects"
            ],
            "keywords": "bleeding, hemorrhage, deep cut, stab wound, severed limb, arterial bleed, blood loss, tourniquet, laceration"
        },
        {
            "category": "fire",
            "title": "Structure Fire, Wildfire & Smoke Evacuation",
            "severity_default": "CRITICAL",
            "source_agency": "National Fire Protection Association (NFPA) & FEMA",
            "summary": "Life-safety procedure during structural fires, electrical blaze, or severe wildfire encirclement.",
            "steps": [
                {
                    "number": 1,
                    "title": "Sound Alarm & Evacuate Instantly",
                    "instruction": "Yell 'FIRE!' and activate building pull-stations. Evacuate immediately via the nearest fire exit. Never waste time collecting personal belongings."
                },
                {
                    "number": 2,
                    "title": "Stay Low Beneath Smoke Layer",
                    "instruction": "Toxic superheated gases and carbon monoxide rise. Crawl on hands and knees where breathable air remains cleanest (within 12 to 24 inches of the floor)."
                },
                {
                    "number": 3,
                    "title": "Feel Closed Doors Before Opening",
                    "instruction": "Use the back of your hand to touch the door, doorknob, and frame. If warm or hot, DO NOT OPEN. Fire is on the other side. Seek an alternate exit or window."
                },
                {
                    "number": 4,
                    "title": "Seal Room If Trapped",
                    "instruction": "If exits are blocked, close the door. Stuff wet towels or clothes under the door cracks. Open window slightly for fresh air, hang a brightly colored cloth, and signal for rescue."
                },
                {
                    "number": 5,
                    "title": "Stop, Drop, and Roll If Clothes Catch Fire",
                    "instruction": "Immediately stop moving, drop flat to the ground, cover face with hands, and roll over and over to smother flames."
                }
            ],
            "dos": [
                "Close doors behind you as you exit to delay fire spread",
                "Use stairwells only; elevators will stall due to power failure or smoke sensor trips",
                "Meet at designated outdoor rally point and account for everyone"
            ],
            "donts": [
                "NEVER re-enter a burning structure for pets or possessions",
                "Do NOT throw water on grease, oil, or electrical fires (causes fireballs)",
                "Do NOT break windows unless necessary for escape (oxygen fuels fire)"
            ],
            "keywords": "fire, smoke, blaze, burning, trapped, flames, building fire, apartment fire, wildfire, electrical fire"
        },
        {
            "category": "flood",
            "title": "Flash Flood & Rapid Water Surge Survival",
            "severity_default": "HIGH",
            "source_agency": "FEMA & National Weather Service (NWS)",
            "summary": "Survival guidelines during severe flash flooding, dam failures, or rising river inundation.",
            "steps": [
                {
                    "number": 1,
                    "title": "Move Instantly to Higher Elevation",
                    "instruction": "Do not wait for mandatory orders if water is rising near your location. Immediately head to high ground or upper building floors."
                },
                {
                    "number": 2,
                    "title": "Turn Around, Don't Drown",
                    "instruction": "Never attempt to walk, swim, or drive through moving water. Just 6 inches of rapid water can knock a person down; 12 inches can sweep away small cars; 24 inches can carry away SUVs and trucks."
                },
                {
                    "number": 3,
                    "title": "Evacuate Sinking Vehicles Upward",
                    "instruction": "If your vehicle is stalled in rising water, unbuckle, lower windows immediately before electronics fail, and climb onto the vehicle roof to signal for water rescue."
                },
                {
                    "number": 4,
                    "title": "Shut Off Utilities If Safe",
                    "instruction": "Before water enters living quarters, shut off main electrical breakers and gas supply valves if dry to reach. Never touch electrical equipment while standing in water."
                },
                {
                    "number": 5,
                    "title": "Do NOT Enter Closed Attics",
                    "instruction": "If trapped inside a flooded house, go to the roof. Do not climb into an enclosed attic unless you have an axe or tool to break out onto the rooftop."
                }
            ],
            "dos": [
                "Stay tuned to NOAA weather radio or emergency broadcasts",
                "Disinfect drinking water or rely strictly on sealed emergency bottles",
                "Watch out for displaced wildlife (snakes) and hidden sewage contamination"
            ],
            "donts": [
                "Do NOT touch downed power lines or water touching electrical poles",
                "Do NOT wade through floodwaters (risk of hidden open manholes and strong suction currents)",
                "Do NOT return home until authorities declare the area safe"
            ],
            "keywords": "flood, flash flood, rising water, torrential rain, river overflow, submerged, hurricane, storm surge"
        },
        {
            "category": "earthquake",
            "title": "Earthquake Drop, Cover & Hold On Protocol",
            "severity_default": "HIGH",
            "source_agency": "USGS & Earthquake Country Alliance",
            "summary": "Proven actions to survive intense seismic shaking and protect against falling debris.",
            "steps": [
                {
                    "number": 1,
                    "title": "DROP to Your Hands and Knees",
                    "instruction": "Drop down before the violent shaking knocks you over. This protects vital organs and allows mobility if needed."
                },
                {
                    "number": 2,
                    "title": "COVER Head and Neck",
                    "instruction": "Crawl under a sturdy desk or table. If no shelter is nearby, crawl next to an interior wall (away from glass) and shield head and neck with both arms."
                },
                {
                    "number": 3,
                    "title": "HOLD ON Until Shaking Stops",
                    "instruction": "Hold onto your shelter with one hand; be prepared to move with it. Keep your other hand shielding your neck."
                },
                {
                    "number": 4,
                    "title": "Expect Severe Aftershocks",
                    "instruction": "Aftershocks frequently occur minutes, hours, or days later and can collapse already weakened structures."
                },
                {
                    "number": 5,
                    "title": "Check for Gas Leaks & Structural Damage",
                    "instruction": "If you smell sulfur/gas, turn off the main gas valve, evacuate immediately, and do NOT use matches or light switches."
                }
            ],
            "dos": [
                "If in bed, stay there, curl face-down, and cover head with pillows",
                "If outdoors, move into an open area away from power lines, chimneys, and tall glass facades",
                "Wear heavy shoes to avoid lacerations from shattered glass during evacuation"
            ],
            "donts": [
                "Do NOT run outside during active shaking (falling masonry is the #1 killer)",
                "Do NOT stand in doorways (modern doors are not structural reinforcements)",
                "Do NOT use elevators"
            ],
            "keywords": "earthquake, tremor, shaking, seismic, rubble, building collapse, aftershock, ground movement"
        },
        {
            "category": "missing_person",
            "title": "Missing Person & Vulnerable Individual Protocol",
            "severity_default": "HIGH",
            "source_agency": "National Center for Missing & Exploited Children (NCMEC) / Interpol",
            "summary": "Rapid response procedures for missing children, elderly dementia wandering, or sudden disappearance.",
            "steps": [
                {
                    "number": 1,
                    "title": "Immediate Area Quick-Search",
                    "instruction": "Thoroughly check high-risk spots immediately: pools, wells, ponds, vehicles, trunks, closets, and washer/dryers."
                },
                {
                    "number": 2,
                    "title": "Alert Law Enforcement Immediately (No Waiting Period)",
                    "instruction": "Call 911 / 112 instantly. There is NO mandatory 24-hour waiting period for reporting missing persons. State age, medical vulnerabilities, and last known location."
                },
                {
                    "number": 3,
                    "title": "Gather Vital Description & Recent Photo",
                    "instruction": "Provide exact height, weight, hair color, distinctive marks, clothing worn (shoes, jacket color), phone number, and GPS tracker data (e.g. Apple Find My, Life360)."
                },
                {
                    "number": 4,
                    "title": "Preserve Scent & Physical Evidence",
                    "instruction": "Do not wash the person's recent bedsheets, unwashed clothes, or toothbrush. Keep their room sealed for search-and-rescue K-9 tracking."
                }
            ],
            "dos": [
                "Notify neighbors and community watch immediately",
                "Check transit hubs and bus stops nearest to last known spot",
                "Have someone remain stationed by the home phone at all times"
            ],
            "donts": [
                "Do NOT conduct massive uncoordinated search parties that contaminate scent trails",
                "Do NOT delay calling police hoping they will turn up",
                "Do NOT withhold personal details or recent arguments from investigating detectives"
            ],
            "keywords": "missing person, lost child, runaway, dementia, wandered off, amber alert, disappearance, abducted"
        },
        {
            "category": "chemical",
            "title": "Hazardous Material (HAZMAT) & Gas Leak Survival",
            "severity_default": "CRITICAL",
            "source_agency": "OSHA & EPA Emergency Response",
            "summary": "Evacuation and shelter-in-place instructions for airborne chemicals, toxic fumes, or industrial pipeline breaches.",
            "steps": [
                {
                    "number": 1,
                    "title": "Move Upwind and Uphill",
                    "instruction": "Most toxic industrial gases are heavier than air and settle in valleys. Determine wind direction and evacuate crosswind or upwind immediately."
                },
                {
                    "number": 2,
                    "title": "Do NOT Create Sparks or Flames",
                    "instruction": "Do not turn light switches on or off, do not use lighters, and do not start automobile engines near a suspected natural gas or propane cloud."
                },
                {
                    "number": 3,
                    "title": "Shelter-in-Place If Evacuation Is Blocked",
                    "instruction": "Go to an interior room with few windows on the highest floor. Seal windows, doors, and air vents with plastic sheeting and duct tape. Turn off HVAC systems."
                },
                {
                    "number": 4,
                    "title": "Decontaminate If Exposed",
                    "instruction": "Remove contaminated clothing by cutting rather than pulling over the head. Flush skin and eyes with copious amounts of clean lukewarm water for 15 minutes."
                }
            ],
            "dos": [
                "Breathe through a wet cloth or respirator if caught in chemical fog",
                "Listen to official EAS broadcasts for safe evacuation corridors",
                "Seek medical triage immediately if burning eyes, nausea, or breathing spasms occur"
            ],
            "donts": [
                "Do NOT walk into colored or visible vapor plumes",
                "Do NOT re-enter the facility until industrial hygiene teams declare zero toxicity",
                "Do NOT use phones near heavy flammable vapor clouds"
            ],
            "keywords": "gas leak, natural gas, chemical spill, hazmat, toxic fumes, carbon monoxide, chlorine, propane, odor, explosion risk"
        }
    ]

    for p_data in protocols:
        EmergencyProtocol.objects.create(**p_data)

    print(f"Successfully seeded {len(protocols)} emergency protocols.")


def seed_emergency_contacts():
    print("Seeding Emergency Contacts...")
    EmergencyContact.objects.all().delete()

    contacts = [
        # United States
        {"name": "National Emergency Dispatch (US/CA)", "service_type": "police", "phone": "911", "region": "US", "is_primary": True, "description": "Immediate Police, Fire & EMS dispatch"},
        {"name": "National Suicide & Crisis Lifeline", "service_type": "helpline", "phone": "988", "region": "US", "is_primary": True, "description": "24/7 Mental health and crisis support"},
        {"name": "American Poison Control Centers", "service_type": "poison", "phone": "1-800-222-1222", "region": "US", "is_primary": True, "description": "Expert toxicological guidance for ingestions and bites"},
        {"name": "FEMA Disaster Helpline", "service_type": "disaster", "phone": "1-800-621-3362", "region": "US", "is_primary": False, "description": "Federal disaster assistance and shelter locating"},

        # India
        {"name": "National Emergency Support System (India)", "service_type": "police", "phone": "112", "region": "IN", "is_primary": True, "description": "All-in-one Emergency Helpline for Police, Fire, Ambulance"},
        {"name": "Emergency Medical Services / Ambulance", "service_type": "ambulance", "phone": "108", "region": "IN", "is_primary": True, "description": "Free 24/7 emergency medical response and transport"},
        {"name": "Fire & Rescue Department", "service_type": "fire", "phone": "101", "region": "IN", "is_primary": True, "description": "Fire emergency and rescue services"},
        {"name": "National Disaster Management Authority (NDMA)", "service_type": "disaster", "phone": "1078", "region": "IN", "is_primary": False, "description": "Disaster management control room"},
        {"name": "National Poison Information Center", "service_type": "poison", "phone": "1800-116-117", "region": "IN", "is_primary": False, "description": "AIIMS Poison Information Center"},

        # United Kingdom
        {"name": "UK Emergency Services (Police/Ambulance/Fire)", "service_type": "police", "phone": "999", "region": "UK", "is_primary": True, "description": "Immediate emergency dispatch across UK"},
        {"name": "NHS Non-Emergency Medical Helpline", "service_type": "ambulance", "phone": "111", "region": "UK", "is_primary": True, "description": "Urgent healthcare advice when life is not directly at risk"},
        {"name": "Police Non-Emergency", "service_type": "police", "phone": "101", "region": "UK", "is_primary": False, "description": "Report non-urgent incidents and crimes"},

        # European Union & Global
        {"name": "European Emergency Number (EU)", "service_type": "police", "phone": "112", "region": "EU", "is_primary": True, "description": "Unified emergency number valid in all EU countries"},
        {"name": "International Universal Emergency Helpline", "service_type": "helpline", "phone": "112", "region": "GLOBAL", "is_primary": True, "description": "Global GSM emergency standard recognized internationally"},
    ]

    for c in contacts:
        EmergencyContact.objects.create(**c)

    print(f"Successfully seeded {len(contacts)} emergency contacts.")


def seed_emergency_facilities():
    print("Seeding Emergency Facilities (Locations)...")
    EmergencyFacility.objects.all().delete()

    facilities = [
        {
            "name": "Bellevue Hospital Trauma Center & EMS Hub",
            "facility_type": "hospital",
            "latitude": 40.7391,
            "longitude": -73.9757,
            "address": "462 1st Avenue, New York, NY 10016",
            "phone": "+1-212-562-4141",
            "is_24_hours": True,
            "emergency_services": "Level 1 Adult & Pediatric Trauma Center, Hyperbaric Chamber, Burn Unit",
            "bed_status": "Available (Level 1 Ready)",
            "rating": 4.9
        },
        {
            "name": "New York Presbyterian Emergency Room",
            "facility_type": "hospital",
            "latitude": 40.7651,
            "longitude": -73.9535,
            "address": "525 E 68th St, New York, NY 10065",
            "phone": "+1-212-746-5454",
            "is_24_hours": True,
            "emergency_services": "Comprehensive Stroke Center, 24/7 Cardiac Catheterization",
            "bed_status": "Available",
            "rating": 4.8
        },
        {
            "name": "Midtown South Precinct Police Station",
            "facility_type": "police",
            "latitude": 40.7505,
            "longitude": -73.9880,
            "address": "357 W 35th St, New York, NY 10001",
            "phone": "+1-212-239-9811",
            "is_24_hours": True,
            "emergency_services": "Tactical Emergency Dispatch, Incident Command, Rapid Deployment",
            "bed_status": "Active Duty",
            "rating": 4.6
        },
        {
            "name": "FDNY Engine Company 1 & Ladder 24",
            "facility_type": "fire",
            "latitude": 40.7485,
            "longitude": -73.9902,
            "address": "142 W 31st St, New York, NY 10001",
            "phone": "+1-718-999-2000",
            "is_24_hours": True,
            "emergency_services": "Heavy Extrication, High-Rise Firefighting, Advanced Life Support",
            "bed_status": "Operational",
            "rating": 5.0
        },
        {
            "name": "Red Cross Metro Disaster Relief & Evacuation Center",
            "facility_type": "shelter",
            "latitude": 40.7634,
            "longitude": -73.9928,
            "address": "520 W 49th St, New York, NY 10019",
            "phone": "+1-877-733-2767",
            "is_24_hours": True,
            "emergency_services": "Mass Care Shelter, Food & Potable Water Distribution, Family Reunification",
            "bed_status": "Open (Capacity: 500+ beds)",
            "rating": 4.9
        }
    ]

    for f in facilities:
        EmergencyFacility.objects.create(**f)

    print(f"Successfully seeded {len(facilities)} emergency facilities.")


if __name__ == '__main__':
    seed_knowledge_base()
    seed_emergency_contacts()
    seed_emergency_facilities()
    print("All backend data successfully seeded!")
