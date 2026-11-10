/**
 * CricDraft 11 - Rating Computation & Squad Generation Script
 * 
 * Computes tournament-specific ratings (60-99) and generates squads.json
 * based strictly on player performance in each World Cup edition (2003-2023).
 * 
 * Sourcing advice:
 * - Match scorecards sourced from Cricsheet ball-by-ball / ESPNcricinfo Statsguru
 * - Big-match definitions adhere strictly to tournament format rules.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. CONFIGURATION OBJECT
export const RATING_CONFIG = {
  minInnings: 3,
  minOvers: 20,
  weights: {
    batter: {
      avg: 0.30,
      sr: 0.25,
      runs: 0.20,
      bigMatch: 0.25,
    },
    bowler: {
      wickets: 0.30,
      econ: 0.25,
      avg: 0.20,
      bigMatchWickets: 0.25,
    },
  },
  scale: {
    min: 60,
    max: 99,
  },
  // Normalization reference benchmarks (clamped)
  benchmarks: {
    bat: {
      minAvg: 10, maxAvg: 85,
      minSr: 65, maxSr: 130,
      minRuns: 40, maxRuns: 650,
      minBmRuns: 0, maxBmRuns: 300,
      minBmAvg: 10, maxBmAvg: 75,
    },
    bowl: {
      minWickets: 2, maxWickets: 23,
      bestEcon: 3.5, worstEcon: 6.8, // Inverted: best gives 100, worst gives 0
      bestAvg: 13.0, worstAvg: 48.0, // Inverted: best gives 100, worst gives 0
      minBmWkts: 0, maxBmWkts: 12,
    }
  }
};

// Big match sets
const QF_2011 = new Set(['India', 'Sri Lanka', 'Pakistan', 'New Zealand', 'Australia', 'England', 'South Africa', 'West Indies']);
const QF_2015 = new Set(['New Zealand', 'Australia', 'South Africa', 'India', 'Pakistan', 'Sri Lanka', 'Bangladesh', 'West Indies']);
const TOP4_2019 = new Set(['England', 'New Zealand', 'India', 'Australia']);
const TOP4_2023 = new Set(['India', 'Australia', 'South Africa', 'New Zealand']);

export function isBigMatch(year, match) {
  const stage = (match.stage || '').toLowerCase();
  if (year === 2003 || year === 2007) {
    return stage.includes('super') || stage.includes('semi') || stage.includes('final');
  } else if (year === 2011) {
    if (stage.includes('quarter') || stage.includes('semi') || stage.includes('final')) return true;
    return stage.includes('group') && QF_2011.has(match.teams[0]) && QF_2011.has(match.teams[1]);
  } else if (year === 2015) {
    if (stage.includes('quarter') || stage.includes('semi') || stage.includes('final')) return true;
    return stage.includes('group') && QF_2015.has(match.teams[0]) && QF_2015.has(match.teams[1]);
  } else if (year === 2019) {
    if (stage.includes('semi') || stage.includes('final')) return true;
    return stage.includes('league') && TOP4_2019.has(match.teams[0]) && TOP4_2019.has(match.teams[1]);
  } else if (year === 2023) {
    if (stage.includes('semi') || stage.includes('final')) return true;
    return stage.includes('league') && TOP4_2023.has(match.teams[0]) && TOP4_2023.has(match.teams[1]);
  }
  return false;
}

// 2. PLAYER MAPPINGS (Abbreviation -> Full Name, Canonical ID, Role)
// Role must be: Opener | Middle | WK | AllRounder | Pace | Spin
const PLAYER_REGISTRY = {
  // INDIA
  'SR Tendulkar': { fullName: 'Sachin Tendulkar', id: 'sachin_tendulkar', role: 'Opener' },
  'SC Ganguly': { fullName: 'Sourav Ganguly', id: 'sourav_ganguly', role: 'Opener' },
  'V Sehwag': { fullName: 'Virender Sehwag', id: 'virender_sehwag', role: 'Opener' },
  'R Dravid': { fullName: 'Rahul Dravid', id: 'rahul_dravid', role: 'Middle' },
  'Yuvraj Singh': { fullName: 'Yuvraj Singh', id: 'yuvraj_singh', role: 'AllRounder' },
  'M Kaif': { fullName: 'Mohammad Kaif', id: 'mohammad_kaif', role: 'Middle' },
  'D Mongia': { fullName: 'Dinesh Mongia', id: 'dinesh_mongia', role: 'AllRounder' },
  'Harbhajan Singh': { fullName: 'Harbhajan Singh', id: 'harbhajan_singh', role: 'Spin' },
  'A Kumble': { fullName: 'Anil Kumble', id: 'anil_kumble', role: 'Spin' },
  'Z Khan': { fullName: 'Zaheer Khan', id: 'zaheer_khan', role: 'Pace' },
  'J Srinath': { fullName: 'Javagal Srinath', id: 'javagal_srinath', role: 'Pace' },
  'A Nehra': { fullName: 'Ashish Nehra', id: 'ashish_nehra', role: 'Pace' },
  'G Gambhir': { fullName: 'Gautam Gambhir', id: 'gautam_gambhir', role: 'Opener' },
  'V Kohli': { fullName: 'Virat Kohli', id: 'virat_kohli', role: 'Middle' },
  'MS Dhoni': { fullName: 'MS Dhoni', id: 'ms_dhoni', role: 'WK' },
  'SK Raina': { fullName: 'Suresh Raina', id: 'suresh_raina', role: 'Middle' },
  'YK Pathan': { fullName: 'Yusuf Pathan', id: 'yusuf_pathan', role: 'AllRounder' },
  'MM Patel': { fullName: 'Munaf Patel', id: 'munaf_patel', role: 'Pace' },
  'S Sreesanth': { fullName: 'S Sreesanth', id: 's_sreesanth', role: 'Pace' },
  'R Ashwin': { fullName: 'Ravichandran Ashwin', id: 'ravichandran_ashwin', role: 'Spin' },
  'PP Chawla': { fullName: 'Piyush Chawla', id: 'piyush_chawla', role: 'Spin' },
  'RG Sharma': { fullName: 'Rohit Sharma', id: 'rohit_sharma', role: 'Opener' },
  'S Dhawan': { fullName: 'Shikhar Dhawan', id: 'shikhar_dhawan', role: 'Opener' },
  'AM Rahane': { fullName: 'Ajinkya Rahane', id: 'ajinkya_rahane', role: 'Middle' },
  'RA Jadeja': { fullName: 'Ravindra Jadeja', id: 'ravindra_jadeja', role: 'AllRounder' },
  'UT Yadav': { fullName: 'Umesh Yadav', id: 'umesh_yadav', role: 'Pace' },
  'Mohammed Shami': { fullName: 'Mohammed Shami', id: 'mohammed_shami', role: 'Pace' },
  'MM Sharma': { fullName: 'Mohit Sharma', id: 'mohit_sharma', role: 'Pace' },
  'B Kumar': { fullName: 'Bhuvneshwar Kumar', id: 'bhuvneshwar_kumar', role: 'Pace' },
  'KL Rahul': { fullName: 'KL Rahul', id: 'kl_rahul', role: 'WK' },
  'JJ Bumrah': { fullName: 'Jasprit Bumrah', id: 'jasprit_bumrah', role: 'Pace' },
  'Kuldeep Yadav': { fullName: 'Kuldeep Yadav', id: 'kuldeep_yadav', role: 'Spin' },
  'YS Chahal': { fullName: 'Yuzvendra Chahal', id: 'yuzvendra_chahal', role: 'Spin' },
  'HH Pandya': { fullName: 'Hardik Pandya', id: 'hardik_pandya', role: 'AllRounder' },
  'KD Karthik': { fullName: 'Dinesh Karthik', id: 'dinesh_karthik', role: 'WK' },
  'RR Pant': { fullName: 'Rishabh Pant', id: 'rishabh_pant', role: 'WK' },
  'SS Iyer': { fullName: 'Shreyas Iyer', id: 'shreyas_iyer', role: 'Middle' },
  'Shubman Gill': { fullName: 'Shubman Gill', id: 'shubman_gill', role: 'Opener' },
  'SA Yadav': { fullName: 'Suryakumar Yadav', id: 'suryakumar_yadav', role: 'Middle' },
  'SN Thakur': { fullName: 'Shardul Thakur', id: 'shardul_thakur', role: 'AllRounder' },
  'Ishan Kishan': { fullName: 'Ishan Kishan', id: 'ishan_kishan', role: 'Opener' },
  'AB Agarkar': { fullName: 'Ajit Agarkar', id: 'ajit_agarkar', role: 'Pace' },
  'PA Patel': { fullName: 'Parthiv Patel', id: 'parthiv_patel', role: 'WK' },
  'SB Bangar': { fullName: 'Sanjay Bangar', id: 'sanjay_bangar', role: 'AllRounder' },
  'IK Pathan': { fullName: 'Irfan Pathan', id: 'irfan_pathan', role: 'AllRounder' },
  'Robin Uthappa': { fullName: 'Robin Uthappa', id: 'robin_uthappa', role: 'Opener' },
  'AT Rayudu': { fullName: 'Ambati Rayudu', id: 'ambati_rayudu', role: 'Middle' },
  'STR Binny': { fullName: 'Stuart Binny', id: 'stuart_binny', role: 'AllRounder' },
  'AR Patel': { fullName: 'Axar Patel', id: 'axar_patel', role: 'AllRounder' },

  // AUSTRALIA
  'AC Gilchrist': { fullName: 'Adam Gilchrist', id: 'adam_gilchrist', role: 'WK' },
  'ML Hayden': { fullName: 'Matthew Hayden', id: 'matthew_hayden', role: 'Opener' },
  'RT Ponting': { fullName: 'Ricky Ponting', id: 'ricky_ponting', role: 'Middle' },
  'DR Martyn': { fullName: 'Damien Martyn', id: 'damien_martyn', role: 'Middle' },
  'DS Lehmann': { fullName: 'Darren Lehmann', id: 'darren_lehmann', role: 'Middle' },
  'MG Bevan': { fullName: 'Michael Bevan', id: 'michael_bevan', role: 'Middle' },
  'AJ Bichel': { fullName: 'Andy Bichel', id: 'andy_bichel', role: 'Pace' },
  'B Lee': { fullName: 'Brett Lee', id: 'brett_lee', role: 'Pace' },
  'GD McGrath': { fullName: 'Glenn McGrath', id: 'glenn_mcgrath', role: 'Pace' },
  'JN Gillespie': { fullName: 'Jason Gillespie', id: 'jason_gillespie', role: 'Pace' },
  'GB Hogg': { fullName: 'Brad Hogg', id: 'brad_hogg', role: 'Spin' },
  'BA Hogg': { fullName: 'Brad Hogg', id: 'brad_hogg', role: 'Spin' },
  'A Symonds': { fullName: 'Andrew Symonds', id: 'andrew_symonds', role: 'AllRounder' },
  'MJ Clarke': { fullName: 'Michael Clarke', id: 'michael_clarke', role: 'Middle' },
  'MEK Hussey': { fullName: 'Michael Hussey', id: 'michael_hussey', role: 'Middle' },
  'SR Watson': { fullName: 'Shane Watson', id: 'shane_watson', role: 'AllRounder' },
  'SW Tait': { fullName: 'Shaun Tait', id: 'shaun_tait', role: 'Pace' },
  'NW Bracken': { fullName: 'Nathan Bracken', id: 'nathan_bracken', role: 'Pace' },
  'BJ Haddin': { fullName: 'Brad Haddin', id: 'brad_haddin', role: 'WK' },
  'DA Warner': { fullName: 'David Warner', id: 'david_warner', role: 'Opener' },
  'SPD Smith': { fullName: 'Steve Smith', id: 'steve_smith', role: 'Middle' },
  'GJ Maxwell': { fullName: 'Glenn Maxwell', id: 'glenn_maxwell', role: 'AllRounder' },
  'MR Marsh': { fullName: 'Mitchell Marsh', id: 'mitchell_marsh', role: 'AllRounder' },
  'JP Faulkner': { fullName: 'James Faulkner', id: 'james_faulkner', role: 'AllRounder' },
  'MA Starc': { fullName: 'Mitchell Starc', id: 'mitchell_starc', role: 'Pace' },
  'MG Johnson': { fullName: 'Mitchell Johnson', id: 'mitchell_johnson', role: 'Pace' },
  'JR Hazlewood': { fullName: 'Josh Hazlewood', id: 'josh_hazlewood', role: 'Pace' },
  'PJ Cummins': { fullName: 'Pat Cummins', id: 'pat_cummins', role: 'Pace' },
  'AJ Finch': { fullName: 'Aaron Finch', id: 'aaron_finch', role: 'Opener' },
  'AT Carey': { fullName: 'Alex Carey', id: 'alex_carey', role: 'WK' },
  'MP Stoinis': { fullName: 'Marcus Stoinis', id: 'marcus_stoinis', role: 'AllRounder' },
  'A Zampa': { fullName: 'Adam Zampa', id: 'adam_zampa', role: 'Spin' },
  'NM Coulter-Nile': { fullName: 'Nathan Coulter-Nile', id: 'nathan_coulter_nile', role: 'Pace' },
  'JA Richardson': { fullName: 'Kane Richardson', id: 'kane_richardson', role: 'Pace' },
  'KW Richardson': { fullName: 'Kane Richardson', id: 'kane_richardson', role: 'Pace' },
  'TM Head': { fullName: 'Travis Head', id: 'travis_head', role: 'Opener' },
  'M Labuschagne': { fullName: 'Marnus Labuschagne', id: 'marnus_labuschagne', role: 'Middle' },
  'JP Inglis': { fullName: 'Josh Inglis', id: 'josh_inglis', role: 'WK' },
  'C Green': { fullName: 'Cameron Green', id: 'cameron_green', role: 'AllRounder' },
  'DJ Hussey': { fullName: 'David Hussey', id: 'david_hussey', role: 'AllRounder' },
  'XJ Doherty': { fullName: 'Xavier Doherty', id: 'xavier_doherty', role: 'Spin' },
  'JJ Krejza': { fullName: 'Jason Krejza', id: 'jason_krejza', role: 'Spin' },
  'CJ Ferguson': { fullName: 'Callum Ferguson', id: 'callum_ferguson', role: 'Middle' },
  'BW Hilfenhaus': { fullName: 'Ben Hilfenhaus', id: 'ben_hilfenhaus', role: 'Pace' },

  // SOUTH AFRICA
  'GC Smith': { fullName: 'Graeme Smith', id: 'graeme_smith', role: 'Opener' },
  'HH Gibbs': { fullName: 'Herschelle Gibbs', id: 'herschelle_gibbs', role: 'Opener' },
  'G Kirsten': { fullName: 'Gary Kirsten', id: 'gary_kirsten', role: 'Opener' },
  'JH Kallis': { fullName: 'Jacques Kallis', id: 'jacques_kallis', role: 'AllRounder' },
  'MV Boucher': { fullName: 'Mark Boucher', id: 'mark_boucher', role: 'WK' },
  'L Klusener': { fullName: 'Lance Klusener', id: 'lance_klusener', role: 'AllRounder' },
  'SM Pollock': { fullName: 'Shaun Pollock', id: 'shaun_pollock', role: 'AllRounder' },
  'M Ntini': { fullName: 'Makhaya Ntini', id: 'makhaya_ntini', role: 'Pace' },
  'A Nel': { fullName: 'Andre Nel', id: 'andre_nel', role: 'Pace' },
  'AB de Villiers': { fullName: 'AB de Villiers', id: 'ab_de_villiers', role: 'Middle' },
  'AG Prince': { fullName: 'Ashwell Prince', id: 'ashwell_prince', role: 'Middle' },
  'JM Kemp': { fullName: 'Justin Kemp', id: 'justin_kemp', role: 'AllRounder' },
  'CK Langeveldt': { fullName: 'Charl Langeveldt', id: 'charl_langeveldt', role: 'Pace' },
  'HM Amla': { fullName: 'Hashim Amla', id: 'hashim_amla', role: 'Opener' },
  'F du Plessis': { fullName: 'Faf du Plessis', id: 'faf_du_plessis', role: 'Middle' },
  'JP Duminy': { fullName: 'JP Duminy', id: 'jp_duminy', role: 'AllRounder' },
  'DA Miller': { fullName: 'David Miller', id: 'david_miller', role: 'Middle' },
  'DW Steyn': { fullName: 'Dale Steyn', id: 'dale_steyn', role: 'Pace' },
  'M Morkel': { fullName: 'Morne Morkel', id: 'morne_morkel', role: 'Pace' },
  'Imran Tahir': { fullName: 'Imran Tahir', id: 'imran_tahir', role: 'Spin' },
  'K Rabada': { fullName: 'Kagiso Rabada', id: 'kagiso_rabada', role: 'Pace' },
  'Q de Kock': { fullName: 'Quinton de Kock', id: 'quinton_de_kock', role: 'WK' },
  'Rassie van der Dussen': { fullName: 'Rassie van der Dussen', id: 'rassie_van_der_dussen', role: 'Middle' },
  'HE van der Dussen': { fullName: 'Rassie van der Dussen', id: 'rassie_van_der_dussen', role: 'Middle' },
  'Aiden Markram': { fullName: 'Aiden Markram', id: 'aiden_markram', role: 'Middle' },
  'AK Markram': { fullName: 'Aiden Markram', id: 'aiden_markram', role: 'Middle' },
  'H Klaasen': { fullName: 'Heinrich Klaasen', id: 'heinrich_klaasen', role: 'Middle' },
  'M Jansen': { fullName: 'Marco Jansen', id: 'marco_jansen', role: 'AllRounder' },
  'G Coetzee': { fullName: 'Gerald Coetzee', id: 'gerald_coetzee', role: 'Pace' },
  'KA Maharaj': { fullName: 'Keshav Maharaj', id: 'keshav_maharaj', role: 'Spin' },
  'L Ngidi': { fullName: 'Lungi Ngidi', id: 'lungi_ngidi', role: 'Pace' },
  'T Shamsi': { fullName: 'Tabraiz Shamsi', id: 'tabraiz_shamsi', role: 'Spin' },
  'CH Morris': { fullName: 'Chris Morris', id: 'chris_morris', role: 'AllRounder' },
  'AL Phehlukwayo': { fullName: 'Andile Phehlukwayo', id: 'andile_phehlukwayo', role: 'AllRounder' },
  'LL Tsotsobe': { fullName: 'Lonwabo Tsotsobe', id: 'lonwabo_tsotsobe', role: 'Pace' },
  'RJ Peterson': { fullName: 'Robin Peterson', id: 'robin_peterson', role: 'Spin' },
  'MN van Wyk': { fullName: 'Morne van Wyk', id: 'morne_van_wyk', role: 'WK' },
  'JL Ontong': { fullName: 'Justin Ontong', id: 'justin_ontong', role: 'AllRounder' },
  'N Boje': { fullName: 'Nicky Boje', id: 'nicky_boje', role: 'Spin' },
  'M Hayward': { fullName: 'M Mornantau Hayward', id: 'mornantau_hayward', role: 'Pace' },
  'AJ Hall': { fullName: 'Andrew Hall', id: 'andrew_hall', role: 'AllRounder' },

  // PAKISTAN
  'Saeed Anwar': { fullName: 'Saeed Anwar', id: 'saeed_anwar', role: 'Opener' },
  'Taufeeq Umar': { fullName: 'Taufeeq Umar', id: 'taufeeq_umar', role: 'Opener' },
  'Inzamam-ul-Haq': { fullName: 'Inzamam-ul-Haq', id: 'inzamam_ul_haq', role: 'Middle' },
  'Yousuf Youhana': { fullName: 'Mohammad Yousuf', id: 'mohammad_yousuf', role: 'Middle' },
  'Mohammad Yousuf': { fullName: 'Mohammad Yousuf', id: 'mohammad_yousuf', role: 'Middle' },
  'Younis Khan': { fullName: 'Younis Khan', id: 'younis_khan', role: 'Middle' },
  'Rashid Latif': { fullName: 'Rashid Latif', id: 'rashid_latif', role: 'WK' },
  'Kamran Akmal': { fullName: 'Kamran Akmal', id: 'kamran_akmal', role: 'WK' },
  'Sarfaraz Ahmed': { fullName: 'Sarfaraz Ahmed', id: 'sarfaraz_ahmed', role: 'WK' },
  'Mohammad Rizwan': { fullName: 'Mohammad Rizwan', id: 'mohammad_rizwan', role: 'WK' },
  'Wasim Akram': { fullName: 'Wasim Akram', id: 'wasim_akram', role: 'Pace' },
  'Waqar Younis': { fullName: 'Waqar Younis', id: 'waqar_younis', role: 'Pace' },
  'Shoaib Akhtar': { fullName: 'Shoaib Akhtar', id: 'shoaib_akhtar', role: 'Pace' },
  'Saqlain Mushtaq': { fullName: 'Saqlain Mushtaq', id: 'saqlain_mushtaq', role: 'Spin' },
  'Shahid Afridi': { fullName: 'Shahid Afridi', id: 'shahid_afridi', role: 'AllRounder' },
  'Abdul Razzaq': { fullName: 'Abdul Razzaq', id: 'abdul_razzaq', role: 'AllRounder' },
  'Azhar Mahmood': { fullName: 'Azhar Mahmood', id: 'azhar_mahmood', role: 'AllRounder' },
  'Shoaib Malik': { fullName: 'Shoaib Malik', id: 'shoaib_malik', role: 'AllRounder' },
  'Mohammad Hafeez': { fullName: 'Mohammad Hafeez', id: 'mohammad_hafeez', role: 'AllRounder' },
  'Misbah-ul-Haq': { fullName: 'Misbah-ul-Haq', id: 'misbah_ul_haq', role: 'Middle' },
  'Umar Akmal': { fullName: 'Umar Akmal', id: 'umar_akmal', role: 'Middle' },
  'Asad Shafiq': { fullName: 'Asad Shafiq', id: 'asad_shafiq', role: 'Middle' },
  'Saeed Ajmal': { fullName: 'Saeed Ajmal', id: 'saeed_ajmal', role: 'Spin' },
  'Wahab Riaz': { fullName: 'Wahab Riaz', id: 'wahab_riaz', role: 'Pace' },
  'Umar Gul': { fullName: 'Umar Gul', id: 'umar_gul', role: 'Pace' },
  'Mohammad Amir': { fullName: 'Mohammad Amir', id: 'mohammad_amir', role: 'Pace' },
  'Babar Azam': { fullName: 'Babar Azam', id: 'babar_azam', role: 'Middle' },
  'Fakhar Zaman': { fullName: 'Fakhar Zaman', id: 'fakhar_zaman', role: 'Opener' },
  'Imam-ul-Haq': { fullName: 'Imam-ul-Haq', id: 'imam_ul_haq', role: 'Opener' },
  'Shaheen Shah Afridi': { fullName: 'Shaheen Afridi', id: 'shaheen_afridi', role: 'Pace' },
  'Haris Rauf': { fullName: 'Haris Rauf', id: 'haris_rauf', role: 'Pace' },
  'Hasan Ali': { fullName: 'Hasan Ali', id: 'hasan_ali', role: 'Pace' },
  'Shadab Khan': { fullName: 'Shadab Khan', id: 'shadab_khan', role: 'AllRounder' },
  'Iftikhar Ahmed': { fullName: 'Iftikhar Ahmed', id: 'iftikhar_ahmed', role: 'AllRounder' },
  'Imad Wasim': { fullName: 'Imad Wasim', id: 'imad_wasim', role: 'AllRounder' },
  'Sohail Khan': { fullName: 'Sohail Khan', id: 'sohail_khan', role: 'Pace' },
  'Rahat Ali': { fullName: 'Rahat Ali', id: 'rahat_ali', role: 'Pace' },
  'Ahmed Shehzad': { fullName: 'Ahmed Shehzad', id: 'ahmed_shehzad', role: 'Opener' },
  'Sarfraz Ahmed': { fullName: 'Sarfaraz Ahmed', id: 'sarfaraz_ahmed', role: 'WK' },
  'Mohammad Irfan': { fullName: 'Mohammad Irfan', id: 'mohammad_irfan', role: 'Pace' },
  'Junaid Khan': { fullName: 'Junaid Khan', id: 'junaid_khan', role: 'Pace' },
  'Mohammad Sami': { fullName: 'Mohammad Sami', id: 'mohammad_sami', role: 'Pace' },
  'Yasir Arafat': { fullName: 'Yasir Arafat', id: 'yasir_arafat', role: 'AllRounder' },
  'Rana Naved-ul-Hasan': { fullName: 'Rana Naved-ul-Hasan', id: 'rana_naved_ul_hasan', role: 'Pace' },
  'Mohammad Asif': { fullName: 'Mohammad Asif', id: 'mohammad_asif', role: 'Pace' },
  'Danish Kaneria': { fullName: 'Danish Kaneria', id: 'danish_kaneria', role: 'Spin' },
  'Imran Nazir': { fullName: 'Imran Nazir', id: 'imran_nazir', role: 'Opener' },
  'Salman Butt': { fullName: 'Salman Butt', id: 'salman_butt', role: 'Opener' },
  'Yasir Hameed': { fullName: 'Yasir Hameed', id: 'yasir_hameed', role: 'Opener' },
  'Saleem Elahi': { fullName: 'Saleem Elahi', id: 'saleem_elahi', role: 'Opener' },

  // SRI LANKA
  'ST Jayasuriya': { fullName: 'Sanath Jayasuriya', id: 'sanath_jayasuriya', role: 'AllRounder' },
  'MS Atapattu': { fullName: 'Marvan Atapattu', id: 'marvan_atapattu', role: 'Opener' },
  'KC Sangakkara': { fullName: 'Kumar Sangakkara', id: 'kumar_sangakkara', role: 'WK' },
  'PA de Silva': { fullName: 'Aravinda de Silva', id: 'aravinda_de_silva', role: 'AllRounder' },
  'DPMD Jayawardene': { fullName: 'Mahela Jayawardene', id: 'mahela_jayawardene', role: 'Middle' },
  'RP Arnold': { fullName: 'Russel Arnold', id: 'russel_arnold', role: 'Middle' },
  'HP Tillakaratne': { fullName: 'Hashan Tillakaratne', id: 'hashan_tillakaratne', role: 'Middle' },
  'WPUJC Vaas': { fullName: 'Chaminda Vaas', id: 'chaminda_vaas', role: 'Pace' },
  'M Muralitharan': { fullName: 'Muttiah Muralitharan', id: 'muttiah_muralitharan', role: 'Spin' },
  'CRD Fernando': { fullName: 'Dilhara Fernando', id: 'dilhara_fernando', role: 'Pace' },
  'PDRL Perera': { fullName: 'Ruchira Perera', id: 'ruchira_perera', role: 'Pace' },
  'TM Dilshan': { fullName: 'Tillakaratne Dilshan', id: 'tillakaratne_dilshan', role: 'AllRounder' },
  'SL Malinga': { fullName: 'Lasith Malinga', id: 'lasith_malinga', role: 'Pace' },
  'AD Mathews': { fullName: 'Angelo Mathews', id: 'angelo_mathews', role: 'AllRounder' },
  'FDM Karunaratne': { fullName: 'Dimuth Karunaratne', id: 'dimuth_karunaratne', role: 'Opener' },
  'KDK Perera': { fullName: 'Kusal Perera', id: 'kusal_perera', role: 'WK' },
  'BKG Mendis': { fullName: 'Kusal Mendis', id: 'kusal_mendis', role: 'WK' },
  'MD Shanaka': { fullName: 'Dasun Shanaka', id: 'dasun_shanaka', role: 'AllRounder' },
  'PWH de Silva': { fullName: 'Wanindu Hasaranga', id: 'wanindu_hasaranga', role: 'AllRounder' },
  'M Theekshana': { fullName: 'Maheesh Theekshana', id: 'maheesh_theekshana', role: 'Spin' },
  'D Madushanka': { fullName: 'Dilshan Madushanka', id: 'dilshan_madushanka', role: 'Pace' },
  'CAK Rajitha': { fullName: 'Kasun Rajitha', id: 'kasun_rajitha', role: 'Pace' },
  'CBRLS Kumara': { fullName: 'Lahiru Kumara', id: 'lahiru_kumara', role: 'Pace' },
  'SS Pathirana': { fullName: 'Suresh Perera', id: 'suresh_perera', role: 'AllRounder' },
  'HMRKB Herath': { fullName: 'Rangana Herath', id: 'rangana_herath', role: 'Spin' },
  'BAW Mendis': { fullName: 'Ajantha Mendis', id: 'ajantha_mendis', role: 'Spin' },
  'KMDN Kulasekara': { fullName: 'Nuwan Kulasekara', id: 'nuwan_kulasekara', role: 'Pace' },
  'NLTC Perera': { fullName: 'Thisara Perera', id: 'thisara_perera', role: 'AllRounder' },
  'HDRL Thirimanne': { fullName: 'Lahiru Thirimanne', id: 'lahiru_thirimanne', role: 'Middle' },
  'SMSM Senanayake': { fullName: 'Sachithra Senanayake', id: 'sachithra_senanayake', role: 'Spin' },
  'RAS Lakmal': { fullName: 'Suranga Lakmal', id: 'suranga_lakmal', role: 'Pace' },
  'TAM Siriwardana': { fullName: 'Milinda Siriwardana', id: 'milinda_siriwardana', role: 'AllRounder' },
  'J Mubarak': { fullName: 'Jehan Mubarak', id: 'jehan_mubarak', role: 'Middle' },
  'MF Maharoof': { fullName: 'Farveez Maharoof', id: 'farveez_maharoof', role: 'AllRounder' },
  'TT Samaraweera': { fullName: 'Thilan Samaraweera', id: 'thilan_samaraweera', role: 'Middle' },
  'CK Kapugedera': { fullName: 'Chamara Kapugedera', id: 'chamara_kapugedera', role: 'Middle' },
  'WU Tharanga': { fullName: 'Upul Tharanga', id: 'upul_tharanga', role: 'Opener' },
  'CM Bandara': { fullName: 'Malinga Bandara', id: 'malinga_bandara', role: 'Spin' },
  'K Weeraratne': { fullName: 'Kaushalya Weeraratne', id: 'kaushalya_weeraratne', role: 'AllRounder' },
  'DA Gunawardene': { fullName: 'Avishka Gunawardene', id: 'avishka_gunawardene', role: 'Opener' },
  'P Nissanka': { fullName: 'Pathum Nissanka', id: 'pathum_nissanka', role: 'Opener' },
  'S Samarawickrama': { fullName: 'Sadeera Samarawickrama', id: 'sadeera_samarawickrama', role: 'Middle' },
  'C Karunaratne': { fullName: 'Chamika Karunaratne', id: 'chamika_karunaratne', role: 'AllRounder' },
  'DN Wellalage': { fullName: 'Dunith Wellalage', id: 'dunith_wellalage', role: 'Spin' },
  'MVT Fernando': { fullName: 'Vishwa Fernando', id: 'vishwa_fernando', role: 'Pace' },
  'DM de Silva': { fullName: 'Dhananjaya de Silva', id: 'dhananjaya_de_silva', role: 'AllRounder' },
  'I Udana': { fullName: 'Isuru Udana', id: 'isuru_udana', role: 'AllRounder' },
  'B Fernando': { fullName: 'Binura Fernando', id: 'binura_fernando', role: 'Pace' },
  'PC de Silva': { fullName: 'Chaturanga de Silva', id: 'chaturanga_de_silva', role: 'AllRounder' },

  // ENGLAND
  'ME Trescothick': { fullName: 'Marcus Trescothick', id: 'marcus_trescothick', role: 'Opener' },
  'NV Knight': { fullName: 'Nick Knight', id: 'nick_knight', role: 'Opener' },
  'MP Vaughan': { fullName: 'Michael Vaughan', id: 'michael_vaughan', role: 'Opener' },
  'N Hussain': { fullName: 'Nasser Hussain', id: 'nasser_hussain', role: 'Middle' },
  'AJ Stewart': { fullName: 'Alec Stewart', id: 'alec_stewart', role: 'WK' },
  'PD Collingwood': { fullName: 'Paul Collingwood', id: 'paul_collingwood', role: 'AllRounder' },
  'A Flintoff': { fullName: 'Andrew Flintoff', id: 'andrew_flintoff', role: 'AllRounder' },
  'C White': { fullName: 'Craig White', id: 'craig_white', role: 'AllRounder' },
  'AR Caddick': { fullName: 'Andy Caddick', id: 'andy_caddick', role: 'Pace' },
  'JM Anderson': { fullName: 'James Anderson', id: 'james_anderson', role: 'Pace' },
  'KP Pietersen': { fullName: 'Kevin Pietersen', id: 'kevin_pietersen', role: 'Middle' },
  'IR Bell': { fullName: 'Ian Bell', id: 'ian_bell', role: 'Opener' },
  'OA Shah': { fullName: 'Owais Shah', id: 'owais_shah', role: 'Middle' },
  'PA Nixon': { fullName: 'Paul Nixon', id: 'paul_nixon', role: 'WK' },
  'SI Mahmood': { fullName: 'Sajid Mahmood', id: 'sajid_mahmood', role: 'Pace' },
  'MS Panesar': { fullName: 'Monty Panesar', id: 'monty_panesar', role: 'Spin' },
  'LE Plunkett': { fullName: 'Liam Plunkett', id: 'liam_plunkett', role: 'Pace' },
  'AJ Strauss': { fullName: 'Andrew Strauss', id: 'andrew_strauss', role: 'Opener' },
  'Jonathan Trott': { fullName: 'Jonathan Trott', id: 'jonathan_trott', role: 'Middle' },
  'IJL Trott': { fullName: 'Jonathan Trott', id: 'jonathan_trott', role: 'Middle' },
  'EJG Morgan': { fullName: 'Eoin Morgan', id: 'eoin_morgan', role: 'Middle' },
  'TT Bresnan': { fullName: 'Tim Bresnan', id: 'tim_bresnan', role: 'AllRounder' },
  'GP Swann': { fullName: 'Graeme Swann', id: 'graeme_swann', role: 'Spin' },
  'SCJ Broad': { fullName: 'Stuart Broad', id: 'stuart_broad', role: 'Pace' },
  'MM Ali': { fullName: 'Moeen Ali', id: 'moeen_ali', role: 'AllRounder' },
  'JC Buttler': { fullName: 'Jos Buttler', id: 'jos_buttler', role: 'WK' },
  'CR Woakes': { fullName: 'Chris Woakes', id: 'chris_woakes', role: 'AllRounder' },
  'JE Root': { fullName: 'Joe Root', id: 'joe_root', role: 'Middle' },
  'BA Stokes': { fullName: 'Ben Stokes', id: 'ben_stokes', role: 'AllRounder' },
  'JM Bairstow': { fullName: 'Jonny Bairstow', id: 'jonny_bairstow', role: 'Opener' },
  'JJ Roy': { fullName: 'Jason Roy', id: 'jason_roy', role: 'Opener' },
  'JOF Archer': { fullName: 'Jofra Archer', id: 'jofra_archer', role: 'Pace' },
  'MA Wood': { fullName: 'Mark Wood', id: 'mark_wood', role: 'Pace' },
  'AU Rashid': { fullName: 'Adil Rashid', id: 'adil_rashid', role: 'Spin' },
  'DJ Malan': { fullName: 'Dawid Malan', id: 'dawid_malan', role: 'Opener' },
  'HC Brook': { fullName: 'Harry Brook', id: 'harry_brook', role: 'Middle' },
  'LS Livingstone': { fullName: 'Liam Livingstone', id: 'liam_livingstone', role: 'AllRounder' },
  'SM Curran': { fullName: 'Sam Curran', id: 'sam_curran', role: 'AllRounder' },
  'DJ Willey': { fullName: 'David Willey', id: 'david_willey', role: 'Pace' },
  'GS Ballance': { fullName: 'Gary Ballance', id: 'gary_ballance', role: 'Middle' },
  'CJ Jordan': { fullName: 'Chris Jordan', id: 'chris_jordan', role: 'Pace' },
  'ST Finn': { fullName: 'Steven Finn', id: 'steven_finn', role: 'Pace' },
  'JW Dernbach': { fullName: 'Jade Dernbach', id: 'jade_dernbach', role: 'Pace' },
  'CT Tremlett': { fullName: 'Chris Tremlett', id: 'chris_tremlett', role: 'Pace' },
  'RJ Sidebottom': { fullName: 'Ryan Sidebottom', id: 'ryan_sidebottom', role: 'Pace' },
  'AN Cook': { fullName: 'Alastair Cook', id: 'alastair_cook', role: 'Opener' },
  'RS Bopara': { fullName: 'Ravi Bopara', id: 'ravi_bopara', role: 'AllRounder' },
  'MH Yardy': { fullName: 'Michael Yardy', id: 'michael_yardy', role: 'AllRounder' },
  'JWA Taylor': { fullName: 'James Taylor', id: 'james_taylor', role: 'Middle' },
  'TK Curran': { fullName: 'Tom Curran', id: 'tom_curran', role: 'Pace' },
  'Gus Atkinson': { fullName: 'Gus Atkinson', id: 'gus_atkinson', role: 'Pace' },
  'RJW Topley': { fullName: 'Reece Topley', id: 'reece_topley', role: 'Pace' },
  'CJ Adams': { fullName: 'Chris Adams', id: 'chris_adams', role: 'Middle' },

  // NEW ZEALAND
  'SP Fleming': { fullName: 'Stephen Fleming', id: 'stephen_fleming', role: 'Opener' },
  'NJ Astle': { fullName: 'Nathan Astle', id: 'nathan_astle', role: 'Opener' },
  'CZ Harris': { fullName: 'Chris Harris', id: 'chris_harris', role: 'AllRounder' },
  'CL Cairns': { fullName: 'Chris Cairns', id: 'chris_cairns', role: 'AllRounder' },
  'SB Styris': { fullName: 'Scott Styris', id: 'scott_styris', role: 'AllRounder' },
  'CD McMillan': { fullName: 'Craig McMillan', id: 'craig_mcmillan', role: 'Middle' },
  'BB McCullum': { fullName: 'Brendon McCullum', id: 'brendon_mccullum', role: 'WK' },
  'JDP Oram': { fullName: 'Jacob Oram', id: 'jacob_oram', role: 'AllRounder' },
  'DL Vettori': { fullName: 'Daniel Vettori', id: 'daniel_vettori', role: 'Spin' },
  'SE Bond': { fullName: 'Shane Bond', id: 'shane_bond', role: 'Pace' },
  'DR Tuffey': { fullName: 'Daryl Tuffey', id: 'daryl_tuffey', role: 'Pace' },
  'KD Mills': { fullName: 'Kyle Mills', id: 'kyle_mills', role: 'Pace' },
  'AR Adams': { fullName: 'Andre Adams', id: 'andre_adams', role: 'AllRounder' },
  'L Vincent': { fullName: 'Lou Vincent', id: 'lou_vincent', role: 'Opener' },
  'PG Fulton': { fullName: 'Peter Fulton', id: 'peter_fulton', role: 'Middle' },
  'LRPL Taylor': { fullName: 'Ross Taylor', id: 'ross_taylor', role: 'Middle' },
  'JEC Franklin': { fullName: 'James Franklin', id: 'james_franklin', role: 'AllRounder' },
  'JS Patel': { fullName: 'Jeetan Patel', id: 'jeetan_patel', role: 'Spin' },
  'MR Gillespie': { fullName: 'Mark Gillespie', id: 'mark_gillespie', role: 'Pace' },
  'MJ Guptill': { fullName: 'Martin Guptill', id: 'martin_guptill', role: 'Opener' },
  'JD Ryder': { fullName: 'Jesse Ryder', id: 'jesse_ryder', role: 'Opener' },
  'KS Williamson': { fullName: 'Kane Williamson', id: 'kane_williamson', role: 'Middle' },
  'TG Southee': { fullName: 'Tim Southee', id: 'tim_southee', role: 'Pace' },
  'TA Boult': { fullName: 'Trent Boult', id: 'trent_boult', role: 'Pace' },
  'CJ Anderson': { fullName: 'Corey Anderson', id: 'corey_anderson', role: 'AllRounder' },
  'GD Elliott': { fullName: 'Grant Elliott', id: 'grant_elliott', role: 'AllRounder' },
  'L Ronchi': { fullName: 'Luke Ronchi', id: 'luke_ronchi', role: 'WK' },
  'AF Milne': { fullName: 'Adam Milne', id: 'adam_milne', role: 'Pace' },
  'MJ Henry': { fullName: 'Matt Henry', id: 'matt_henry', role: 'Pace' },
  'TWM Latham': { fullName: 'Tom Latham', id: 'tom_latham', role: 'WK' },
  'C de Grandhomme': { fullName: 'Colin de Grandhomme', id: 'colin_de_grandhomme', role: 'AllRounder' },
  'JDS Neesham': { fullName: 'Jimmy Neesham', id: 'jimmy_neesham', role: 'AllRounder' },
  'MJ Santner': { fullName: 'Mitchell Santner', id: 'mitchell_santner', role: 'AllRounder' },
  'LH Ferguson': { fullName: 'Lockie Ferguson', id: 'lockie_ferguson', role: 'Pace' },
  'IS Sodhi': { fullName: 'Ish Sodhi', id: 'ish_sodhi', role: 'Spin' },
  'DP Conway': { fullName: 'Devon Conway', id: 'devon_conway', role: 'Opener' },
  'WA Young': { fullName: 'Will Young', id: 'will_young', role: 'Opener' },
  'R Ravindra': { fullName: 'Rachin Ravindra', id: 'rachin_ravindra', role: 'AllRounder' },
  'DJ Mitchell': { fullName: 'Daryl Mitchell', id: 'daryl_mitchell', role: 'Middle' },
  'GD Phillips': { fullName: 'Glenn Phillips', id: 'glenn_phillips', role: 'AllRounder' },
  'MS Chapman': { fullName: 'Mark Chapman', id: 'mark_chapman', role: 'Middle' },
  'HM Nicholls': { fullName: 'Henry Nicholls', id: 'henry_nicholls', role: 'Middle' },
  'NL McCullum': { fullName: 'Nathan McCullum', id: 'nathan_mccullum', role: 'AllRounder' },
  'HJH Marshall': { fullName: 'Hamish Marshall', id: 'hamish_marshall', role: 'Middle' },
  'MN Hart': { fullName: 'Matthew Hart', id: 'matthew_hart', role: 'Spin' },
  'CJ Nevin': { fullName: 'Chris Nevin', id: 'chris_nevin', role: 'WK' },
  'PJ Wiseman': { fullName: 'Paul Wiseman', id: 'paul_wiseman', role: 'Spin' },
  'CS Martin': { fullName: 'Chris Martin', id: 'chris_martin', role: 'Pace' },

  // WEST INDIES
  'CH Gayle': { fullName: 'Chris Gayle', id: 'chris_gayle', role: 'Opener' },
  'Wavell Hinds': { fullName: 'Wavell Hinds', id: 'wavell_hinds', role: 'Opener' },
  'BC Lara': { fullName: 'Brian Lara', id: 'brian_lara', role: 'Middle' },
  'RR Sarwan': { fullName: 'Ramnaresh Sarwan', id: 'ramnaresh_sarwan', role: 'Middle' },
  'S Chanderpaul': { fullName: 'Shivnarine Chanderpaul', id: 'shivnarine_chanderpaul', role: 'Middle' },
  'RL Powell': { fullName: 'Ricardo Powell', id: 'ricardo_powell', role: 'Middle' },
  'RD Jacobs': { fullName: 'Ridley Jacobs', id: 'ridley_jacobs', role: 'WK' },
  'VC Drakes': { fullName: 'Vasbert Drakes', id: 'vasbert_drakes', role: 'Pace' },
  'M Dillon': { fullName: 'Mervyn Dillon', id: 'mervyn_dillon', role: 'Pace' },
  'PT Collins': { fullName: 'Pedro Collins', id: 'pedro_collins', role: 'Pace' },
  'CD Collymore': { fullName: 'Corey Collymore', id: 'corey_collymore', role: 'Pace' },
  'DBL Powell': { fullName: 'Daren Powell', id: 'daren_powell', role: 'Pace' },
  'MN Samuels': { fullName: 'Marlon Samuels', id: 'marlon_samuels', role: 'Middle' },
  'DJ Bravo': { fullName: 'Dwayne Bravo', id: 'dwayne_bravo', role: 'AllRounder' },
  'D Ramdin': { fullName: 'Denesh Ramdin', id: 'denesh_ramdin', role: 'WK' },
  'JE Taylor': { fullName: 'Jerome Taylor', id: 'jerome_taylor', role: 'Pace' },
  'KA Edwards': { fullName: 'Kirk Edwards', id: 'kirk_edwards', role: 'Middle' },
  'DM Bravo': { fullName: 'Darren Bravo', id: 'darren_bravo', role: 'Middle' },
  'KA Pollard': { fullName: 'Kieron Pollard', id: 'kieron_pollard', role: 'AllRounder' },
  'DJG Sammy': { fullName: 'Daren Sammy', id: 'daren_sammy', role: 'AllRounder' },
  'AD Russell': { fullName: 'Andre Russell', id: 'andre_russell', role: 'AllRounder' },
  'SJ Benn': { fullName: 'Sulieman Benn', id: 'sulieman_benn', role: 'Spin' },
  'D Bishoo': { fullName: 'Devendra Bishoo', id: 'devendra_bishoo', role: 'Spin' },
  'RPO Nurse': { fullName: 'Ashley Nurse', id: 'ashley_nurse', role: 'Spin' },
  'JO Holder': { fullName: 'Jason Holder', id: 'jason_holder', role: 'AllRounder' },
  'CR Brathwaite': { fullName: 'Carlos Brathwaite', id: 'carlos_brathwaite', role: 'AllRounder' },
  'SD Hope': { fullName: 'Shai Hope', id: 'shai_hope', role: 'WK' },
  'N Pooran': { fullName: 'Nicholas Pooran', id: 'nicholas_pooran', role: 'WK' },
  'SO Hetmyer': { fullName: 'Shimron Hetmyer', id: 'shimron_hetmyer', role: 'Middle' },
  'E Lewis': { fullName: 'Evin Lewis', id: 'evin_lewis', role: 'Opener' },
  'SS Cottrell': { fullName: 'Sheldon Cottrell', id: 'sheldon_cottrell', role: 'Pace' },
  'O Thomas': { fullName: 'Oshane Thomas', id: 'oshane_thomas', role: 'Pace' },
  'KAJ Roach': { fullName: 'Kemar Roach', id: 'kemar_roach', role: 'Pace' },
  'JL Carter': { fullName: 'Jonathan Carter', id: 'jonathan_carter', role: 'Middle' },
  'DS Smith': { fullName: 'Dwayne Smith', id: 'dwayne_smith', role: 'Opener' },
  'NO Miller': { fullName: 'Nikita Miller', id: 'nikita_miller', role: 'Spin' },
  'WW Hinds': { fullName: 'Wavell Hinds', id: 'wavell_hinds', role: 'Opener' },
  'NC McGarrell': { fullName: 'Neil McGarrell', id: 'neil_mcgarrell', role: 'Spin' },
  'RO Hurley': { fullName: 'Ryan Hinds', id: 'ryan_hinds', role: 'AllRounder' },
  'DR Smith': { fullName: 'Dwayne Smith', id: 'dwayne_smith', role: 'Opener' },
  'IO Jackson': { fullName: 'Ian Bradshaw', id: 'ian_bradshaw', role: 'Pace' },
  'IDR Bradshaw': { fullName: 'Ian Bradshaw', id: 'ian_bradshaw', role: 'Pace' },
  'LMP Simmons': { fullName: 'Lendl Simmons', id: 'lendl_simmons', role: 'Opener' },
  'FA Allen': { fullName: 'Fabian Allen', id: 'fabian_allen', role: 'AllRounder' },
  'SW Ambris': { fullName: 'Sunil Ambris', id: 'sunil_ambris', role: 'Opener' },
  'FA Adams': { fullName: 'Floyd Reifer', id: 'floyd_reifer', role: 'Middle' },
  'AB Barath': { fullName: 'Adrian Barath', id: 'adrian_barath', role: 'Opener' },

  // BANGLADESH
  'Tamim Iqbal': { fullName: 'Tamim Iqbal', id: 'tamim_iqbal', role: 'Opener' },
  'Litton Das': { fullName: 'Litton Das', id: 'litton_das', role: 'WK' },
  'Najmul Hossain Shanto': { fullName: 'Najmul Hossain Shanto', id: 'najmul_hossain_shanto', role: 'Middle' },
  'Shakib Al Hasan': { fullName: 'Shakib Al Hasan', id: 'shakib_al_hasan', role: 'AllRounder' },
  'Mushfiqur Rahim': { fullName: 'Mushfiqur Rahim', id: 'mushfiqur_rahim', role: 'WK' },
  'Mahmudullah': { fullName: 'Mahmudullah', id: 'mahmudullah', role: 'AllRounder' },
  'Mehidy Hasan Miraz': { fullName: 'Mehidy Hasan Miraz', id: 'mehidy_hasan_miraz', role: 'AllRounder' },
  'Towhid Hridoy': { fullName: 'Towhid Hridoy', id: 'towhid_hridoy', role: 'Middle' },
  'Taskin Ahmed': { fullName: 'Taskin Ahmed', id: 'taskin_ahmed', role: 'Pace' },
  'Mustafizur Rahman': { fullName: 'Mustafizur Rahman', id: 'mustafizur_rahman', role: 'Pace' },
  'Shoriful Islam': { fullName: 'Shoriful Islam', id: 'shoriful_islam', role: 'Pace' },
  'Tanzid Hasan': { fullName: 'Tanzid Hasan', id: 'tanzid_hasan', role: 'Opener' },
  'Nasum Ahmed': { fullName: 'Nasum Ahmed', id: 'nasum_ahmed', role: 'Spin' },
  'Mahedi Hasan': { fullName: 'Mahedi Hasan', id: 'mahedi_hasan', role: 'Spin' },
  'Hasan Mahmud': { fullName: 'Hasan Mahmud', id: 'hasan_mahmud', role: 'Pace' },
  'Tanzim Hasan Sakib': { fullName: 'Tanzim Hasan Sakib', id: 'tanzim_hasan_sakib', role: 'Pace' },
  'Soumya Sarkar': { fullName: 'Soumya Sarkar', id: 'soumya_sarkar', role: 'Opener' },
  'Mohammad Mithun': { fullName: 'Mohammad Mithun', id: 'mohammad_mithun', role: 'Middle' },
  'Mosaddek Hossain': { fullName: 'Mosaddek Hossain', id: 'mosaddek_hossain', role: 'AllRounder' },
  'Rubel Hossain': { fullName: 'Rubel Hossain', id: 'rubel_hossain', role: 'Pace' },
  'Mashrafe Mortaza': { fullName: 'Mashrafe Mortaza', id: 'mashrafe_mortaza', role: 'Pace' },
  'Abu Jayed': { fullName: 'Abu Jayed', id: 'abu_jayed', role: 'Pace' },
  'Mohammad Saifuddin': { fullName: 'Mohammad Saifuddin', id: 'mohammad_saifuddin', role: 'AllRounder' },
  'Sabbir Rahman': { fullName: 'Sabbir Rahman', id: 'sabbir_rahman', role: 'Middle' },
  'Nasir Hossain': { fullName: 'Nasir Hossain', id: 'nasir_hossain', role: 'AllRounder' },
  'Anamul Haque': { fullName: 'Anamul Haque', id: 'anamul_haque', role: 'Opener' },
  'Mominul Haque': { fullName: 'Mominul Haque', id: 'mominul_haque', role: 'Middle' },
  'Arafat Sunny': { fullName: 'Arafat Sunny', id: 'arafat_sunny', role: 'Spin' },
  'Taijul Islam': { fullName: 'Taijul Islam', id: 'taijul_islam', role: 'Spin' },
  'Shafiul Islam': { fullName: 'Shafiul Islam', id: 'shafiul_islam', role: 'Pace' },
  'Imrul Kayes': { fullName: 'Imrul Kayes', id: 'imrul_kayes', role: 'Opener' },
  'Raqibul Hasan': { fullName: 'Raqibul Hasan', id: 'raqibul_hasan', role: 'Middle' },
  'Shahriar Nafees': { fullName: 'Shahriar Nafees', id: 'shahriar_nafees', role: 'Opener' },
  'Aftab Ahmed': { fullName: 'Aftab Ahmed', id: 'aftab_ahmed', role: 'Middle' },
  'Habibul Bashar': { fullName: 'Habibul Bashar', id: 'habibul_bashar', role: 'Middle' },
  'Mohammad Rafique': { fullName: 'Mohammad Rafique', id: 'mohammad_rafique', role: 'Spin' },
  'Abdur Razzak': { fullName: 'Abdur Razzak', id: 'abdur_razzak', role: 'Spin' },
  'Syed Rasel': { fullName: 'Syed Rasel', id: 'syed_rasel', role: 'Pace' },
  'Tapash Baisya': { fullName: 'Tapash Baisya', id: 'tapash_baisya', role: 'Pace' },
  'Rajin Saleh': { fullName: 'Rajin Saleh', id: 'rajin_saleh', role: 'Middle' },
  'Javed Omar': { fullName: 'Javed Omar', id: 'javed_omar', role: 'Opener' },
  'Khaled Mashud': { fullName: 'Khaled Mashud', id: 'khaled_mashud', role: 'WK' },
  'Alok Kapali': { fullName: 'Alok Kapali', id: 'alok_kapali', role: 'AllRounder' },
  'Manjural Islam': { fullName: 'Manjural Islam', id: 'manjural_islam', role: 'Pace' },
  'Talha Jubair': { fullName: 'Talha Jubair', id: 'talha_jubair', role: 'Pace' },
  'Ehsanul Hoque': { fullName: 'Ehsanul Hoque', id: 'ehsanul_hoque', role: 'Middle' },
  'Hannan Sarkar': { fullName: 'Hannan Sarkar', id: 'hannan_sarkar', role: 'Opener' },
  'Sanwar Hossain': { fullName: 'Sanwar Hossain', id: 'sanwar_hossain', role: 'Middle' },

  // NETHERLANDS
  'W Barresi': { fullName: 'Wesley Barresi', id: 'wesley_barresi', role: 'Middle' },
  'Vikramjit Singh': { fullName: 'Vikramjit Singh', id: 'vikramjit_singh', role: 'Opener' },
  'MP O\'Dowd': { fullName: 'Max O\'Dowd', id: 'max_odowd', role: 'Opener' },
  'CN Ackermann': { fullName: 'Colin Ackermann', id: 'colin_ackermann', role: 'AllRounder' },
  'SA Edwards': { fullName: 'Scott Edwards', id: 'scott_edwards', role: 'WK' },
  'BFW de Leede': { fullName: 'Bas de Leede', id: 'bas_de_leede', role: 'AllRounder' },
  'Sybrand Engelbrecht': { fullName: 'Sybrand Engelbrecht', id: 'sybrand_engelbrecht', role: 'Middle' },
  'Teja Nidamanuru': { fullName: 'Teja Nidamanuru', id: 'teja_nidamanuru', role: 'Middle' },
  'Logan van Beek': { fullName: 'Logan van Beek', id: 'logan_van_beek', role: 'AllRounder' },
  'Roelof van der Merwe': { fullName: 'Roelof van der Merwe', id: 'roelof_van_der_merwe', role: 'AllRounder' },
  'Aryan Dutt': { fullName: 'Aryan Dutt', id: 'aryan_dutt', role: 'Spin' },
  'Paul van Meekeren': { fullName: 'Paul van Meekeren', id: 'paul_van_meekeren', role: 'Pace' },
  'Shariz Ahmad': { fullName: 'Shariz Ahmad', id: 'shariz_ahmad', role: 'Spin' },
  'Ryan Klein': { fullName: 'Ryan Klein', id: 'ryan_klein', role: 'Pace' },
  'Saqib Zulfiqar': { fullName: 'Saqib Zulfiqar', id: 'saqib_zulfiqar', role: 'AllRounder' },
};

// 3. Squad Structure Definitions (8 teams x 6 editions = 48 squads)
const SQUADS_BY_YEAR = {
  2003: ['Australia', 'India', 'Sri Lanka', 'New Zealand', 'South Africa', 'England', 'Pakistan', 'West Indies'],
  2007: ['Australia', 'Sri Lanka', 'New Zealand', 'South Africa', 'England', 'West Indies', 'India', 'Pakistan'],
  2011: ['India', 'Sri Lanka', 'Pakistan', 'New Zealand', 'Australia', 'England', 'South Africa', 'West Indies'],
  2015: ['Australia', 'New Zealand', 'South Africa', 'India', 'Pakistan', 'Sri Lanka', 'England', 'West Indies'],
  2019: ['England', 'New Zealand', 'Australia', 'India', 'Pakistan', 'South Africa', 'Sri Lanka', 'West Indies'],
  2023: ['Australia', 'India', 'South Africa', 'New Zealand', 'Pakistan', 'England', 'Sri Lanka', 'Bangladesh']
};

const COUNTRY_CODE_MAP = {
  'India': 'ind',
  'Australia': 'aus',
  'England': 'eng',
  'South Africa': 'sa',
  'New Zealand': 'nz',
  'Pakistan': 'pak',
  'Sri Lanka': 'sl',
  'West Indies': 'wi',
  'Bangladesh': 'ban',
  'Netherlands': 'ned'
};

// Heuristic fallback for any unmapped player
function resolvePlayerInfo(shortName, team, stats) {
  if (PLAYER_REGISTRY[shortName]) {
    return { ...PLAYER_REGISTRY[shortName] };
  }
  
  // Heuristic deduction:
  const isBowler = (stats.bowlBalls || 0) > 60;
  const isBatter = (stats.runs || 0) > 50 || (stats.inn || 0) >= 3;
  let role = 'Middle';
  if (isBowler && isBatter) {
    role = 'AllRounder';
  } else if (isBowler) {
    role = 'Pace';
  } else if (stats.topPos <= 2) {
    role = 'Opener';
  }

  const cleanName = shortName.replace(/[^a-zA-Z\s]/g, '').trim();
  const id = cleanName.toLowerCase().replace(/\s+/g, '_');
  return {
    fullName: shortName,
    id: id || 'player_' + Math.random().toString(36).substr(2, 5),
    role: role
  };
}

// 4. STAT HARVESTING FROM MATCHES
function harvestTournamentStats(year, matchData) {
  const pStats = {}; // key: playerShortName -> stats
  const teamPlayers = {}; // key: teamName -> Set of playerShortNames

  matchData.matches.forEach(match => {
    const isBig = isBigMatch(year, match);

    // Track playing XI
    if (match.playing_xi) {
      Object.entries(match.playing_xi).forEach(([team, players]) => {
        if (!teamPlayers[team]) teamPlayers[team] = new Map();
        players.forEach(p => {
          if (!teamPlayers[team].has(p)) teamPlayers[team].set(p, 0);
          teamPlayers[team].set(p, teamPlayers[team].get(p) + 1);
        });
      });
    }

    // Process innings
    match.innings.forEach(inn => {
      // Batting
      (inn.batting || []).forEach(b => {
        if (!pStats[b.name]) {
          pStats[b.name] = {
            runs: 0, balls: 0, outs: 0, inn: 0,
            bmRuns: 0, bmOuts: 0, bmInn: 0,
            bowlBalls: 0, bowlRuns: 0, wkts: 0, bmWkts: 0,
            topPos: b.pos || 5
          };
        }
        pStats[b.name].runs += b.runs;
        pStats[b.name].balls += b.balls;
        pStats[b.name].inn += 1;
        if (b.pos && b.pos < pStats[b.name].topPos) pStats[b.name].topPos = b.pos;
        if (b.out) pStats[b.name].outs += 1;

        if (isBig) {
          pStats[b.name].bmRuns += b.runs;
          pStats[b.name].bmInn += 1;
          if (b.out) pStats[b.name].bmOuts += 1;
        }
      });

      // Bowling
      (inn.bowling || []).forEach(bw => {
        if (!pStats[bw.name]) {
          pStats[bw.name] = {
            runs: 0, balls: 0, outs: 0, inn: 0,
            bmRuns: 0, bmOuts: 0, bmInn: 0,
            bowlBalls: 0, bowlRuns: 0, wkts: 0, bmWkts: 0,
            topPos: 8
          };
        }
        pStats[bw.name].bowlBalls += bw.balls;
        pStats[bw.name].bowlRuns += bw.runs;
        pStats[bw.name].wkts += bw.wickets;

        if (isBig) {
          pStats[bw.name].bmWkts += bw.wickets;
        }
      });
    });
  });

  return { pStats, teamPlayers };
}

// 5. NORMALIZATION AND SCALING
function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function normLinear(val, min, max) {
  if (val <= min) return 0;
  if (val >= max) return 100;
  return ((val - min) / (max - min)) * 100;
}

function normInverted(val, best, worst) {
  if (val <= best) return 100;
  if (val >= worst) return 0;
  return ((worst - val) / (worst - best)) * 100;
}

export function computeBattingScore(raw, sampleFilter = true) {
  const b = RATING_CONFIG.benchmarks.bat;
  const w = RATING_CONFIG.weights.batter;

  const nAvg = normLinear(raw.avg, b.minAvg, b.maxAvg);
  const nSr = normLinear(raw.sr, b.minSr, b.maxSr);
  const nRuns = normLinear(raw.runs, b.minRuns, b.maxRuns);

  // Big match component is a composite of big match runs and big match average
  const nBmRuns = normLinear(raw.bigMatchRuns, b.minBmRuns, b.maxBmRuns);
  const nBmAvg = normLinear(raw.bigMatchAvg, b.minBmAvg, b.maxBmAvg);
  const nBigMatch = 0.6 * nBmRuns + 0.4 * nBmAvg;

  let rawScore = (nAvg * w.avg) + (nSr * w.sr) + (nRuns * w.runs) + (nBigMatch * w.bigMatch);

  // Minimum sample filter: batters need at least 3 innings
  if (sampleFilter && raw.inn < RATING_CONFIG.minInnings) {
    const factor = Math.max(0.2, raw.inn / RATING_CONFIG.minInnings);
    rawScore = rawScore * factor;
  }

  return clamp(rawScore, 0, 100);
}

export function computeBowlingScore(raw, sampleFilter = true) {
  const b = RATING_CONFIG.benchmarks.bowl;
  const w = RATING_CONFIG.weights.bowler;

  if (!raw.overs || raw.overs < 1) {
    return 0; // Pure non-bowler
  }

  const nWkts = normLinear(raw.wickets, b.minWickets, b.maxWickets);
  const nEcon = normInverted(raw.econ, b.bestEcon, b.worstEcon);
  const nAvg = normInverted(raw.avg, b.bestAvg, b.worstAvg);
  const nBmWkts = normLinear(raw.bigMatchWickets, b.minBmWkts, b.maxBmWkts);

  let rawScore = (nWkts * w.wickets) + (nEcon * w.econ) + (nAvg * w.avg) + (nBmWkts * w.bigMatchWickets);

  // Minimum sample filter: bowlers need at least 20 overs
  if (sampleFilter && raw.overs < RATING_CONFIG.minOvers) {
    const factor = Math.max(0.15, raw.overs / RATING_CONFIG.minOvers);
    rawScore = rawScore * factor;
  }

  return clamp(rawScore, 0, 100);
}

export function scaleScoreToRating(score) {
  const min = RATING_CONFIG.scale.min;
  const max = RATING_CONFIG.scale.max;
  return Math.round(min + (score / 100) * (max - min));
}

// 6. MAIN SQUAD GENERATION PIPELINE
export function generateSquads(rawDir, outputPath) {
  const allSquads = [];

  for (const year of [2003, 2007, 2011, 2015, 2019, 2023]) {
    const filePath = path.join(rawDir, `wc_${year}.json`);
    if (!fs.existsSync(filePath)) {
      console.warn(`File not found: ${filePath}, skipping year ${year}`);
      continue;
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const { pStats, teamPlayers } = harvestTournamentStats(year, data);
    const targetTeams = SQUADS_BY_YEAR[year] || [];

    for (const team of targetTeams) {
      const squadId = `${COUNTRY_CODE_MAP[team] || team.toLowerCase().substr(0, 3)}_${year}`;
      const appearances = teamPlayers[team] || new Map();

      // Sort players by appearances in the tournament
      const sortedPlayerNames = Array.from(appearances.entries())
        .sort((a, b) => b[1] - a[1])
        .map(entry => entry[0]);

      // Take up to 15 players who actually appeared
      const squadPlayerNames = sortedPlayerNames.slice(0, 15);

      // If fewer than 15, fill from registered team reserves
      if (squadPlayerNames.length < 15) {
        for (const [short, info] of Object.entries(PLAYER_REGISTRY)) {
          if (!squadPlayerNames.includes(short) && squadPlayerNames.length < 15) {
            if (isPlayerForTeam(short, team)) {
              squadPlayerNames.push(short);
            }
          }
        }
      }

      const squadPlayers = squadPlayerNames.map(shortName => {
        const raw = pStats[shortName] || {
          runs: 0, balls: 0, outs: 0, inn: 0,
          bmRuns: 0, bmOuts: 0, bmInn: 0,
          bowlBalls: 0, bowlRuns: 0, wkts: 0, bmWkts: 0, topPos: 6
        };

        const playerInfo = resolvePlayerInfo(shortName, team, raw);
        const isEstimated = raw.inn === 0 && raw.bowlBalls === 0;

        // Calculate bat stats
        const batAvg = raw.outs > 0 ? +(raw.runs / raw.outs).toFixed(1) : (raw.runs > 0 ? +raw.runs.toFixed(1) : 0);
        const batSr = raw.balls > 0 ? +((raw.runs / raw.balls) * 100).toFixed(1) : 0;
        const bmAvg = raw.bmOuts > 0 ? +(raw.bmRuns / raw.bmOuts).toFixed(1) : (raw.bmRuns > 0 ? +raw.bmRuns.toFixed(1) : 0);

        // Calculate bowl stats
        const overs = +(raw.bowlBalls / 6).toFixed(1);
        const econ = overs > 0 ? +(raw.bowlRuns / overs).toFixed(2) : 0;
        const bowlAvg = raw.wkts > 0 ? +(raw.bowlRuns / raw.wkts).toFixed(1) : 0;

        // Structured stat objects matching required schema
        const batObj = {
          avg: batAvg,
          sr: batSr,
          runs: raw.runs,
          bigMatchRuns: raw.bmRuns,
          bigMatchAvg: bmAvg
        };

        const bowlObj = {
          econ: econ,
          wickets: raw.wkts,
          avg: bowlAvg,
          bigMatchWickets: raw.bmWkts
        };

        // Compute scores
        const batScore = computeBattingScore({ ...batObj, inn: raw.inn });
        const bowlScore = computeBowlingScore({ ...bowlObj, overs: overs });

        let battingRating = scaleScoreToRating(batScore);
        let bowlingRating = scaleScoreToRating(bowlScore);

        // Role-specific rating adjustments
        const role = playerInfo.role;
        let cost = 60;

        if (role === 'Opener' || role === 'Middle' || role === 'WK') {
          bowlingRating = 60;
          cost = battingRating;
        } else if (role === 'Pace' || role === 'Spin') {
          battingRating = Math.min(battingRating, 68);
          cost = bowlingRating;
        } else if (role === 'AllRounder') {
          cost = Math.round((battingRating * 0.5) + (bowlingRating * 0.5));
        }

        cost = clamp(cost, 60, 99);

        const playerCard = {
          name: playerInfo.fullName,
          shortName: shortName,
          canonicalId: playerInfo.id,
          role: role,
          bat: batObj,
          bowl: bowlObj,
          battingRating: battingRating,
          bowlingRating: bowlingRating,
          cost: cost
        };

        if (isEstimated) {
          playerCard.estimated = true;
        }

        return playerCard;
      });

      // Ensure squad has exactly 15 players
      while (squadPlayers.length < 15) {
        const dummyNum = squadPlayers.length + 1;
        squadPlayers.push({
          name: `${team} Reserve ${dummyNum}`,
          shortName: `Res ${dummyNum}`,
          canonicalId: `${squadId}_res_${dummyNum}`,
          role: dummyNum % 2 === 0 ? 'Pace' : 'Middle',
          bat: { avg: 15.0, sr: 75.0, runs: 45, bigMatchRuns: 0, bigMatchAvg: 0 },
          bowl: { econ: 5.5, wickets: 2, avg: 35.0, bigMatchWickets: 0 },
          battingRating: 62,
          bowlingRating: 62,
          cost: 62,
          estimated: true
        });
      }

      allSquads.push({
        id: squadId,
        country: team,
        year: year,
        players: squadPlayers
      });
    }
  }

  // Write squads.json
  const jsonContent = JSON.stringify(allSquads, null, 2);
  fs.writeFileSync(outputPath, jsonContent, 'utf-8');
  console.log(`Successfully generated ${allSquads.length} squads into ${outputPath}!`);

  printSummaryAndHighlights(allSquads);
}

function isPlayerForTeam(shortName, team) {
  const info = PLAYER_REGISTRY[shortName];
  if (!info) return false;
  if (team === 'India' && ['sachin_tendulkar', 'virat_kohli', 'rohit_sharma', 'ms_dhoni', 'zaheer_khan'].includes(info.id)) return true;
  if (team === 'Australia' && ['ricky_ponting', 'adam_gilchrist', 'glenn_mcgrath', 'steve_smith', 'mitchell_starc'].includes(info.id)) return true;
  return false;
}

function printSummaryAndHighlights(squads) {
  console.log(`\n=================== CRICDRAFT 11 DATASET SUMMARY ===================`);
  console.log(`Total Squads: ${squads.length}`);
  const allCards = squads.flatMap(s => s.players.map(p => ({ ...p, squad: `${s.country} (${s.year})` })));
  console.log(`Total Player Cards: ${allCards.length}`);

  console.log(`\n--- TOP 10 HIGHEST RATED BATTERS (60-99) ---`);
  const topBatters = [...allCards]
    .filter(p => p.role === 'Opener' || p.role === 'Middle' || p.role === 'WK' || p.role === 'AllRounder')
    .sort((a, b) => b.battingRating - a.battingRating || b.bat.runs - a.bat.runs)
    .slice(0, 10);
  topBatters.forEach((p, i) => {
    console.log(`${i + 1}. ${p.name} [${p.squad}] - Rating: ${p.battingRating} (Runs: ${p.bat.runs}, Avg: ${p.bat.avg}, SR: ${p.bat.sr}, BigMatchRuns: ${p.bat.bigMatchRuns})`);
  });

  console.log(`\n--- TOP 10 HIGHEST RATED BOWLERS (60-99) ---`);
  const topBowlers = [...allCards]
    .filter(p => p.role === 'Pace' || p.role === 'Spin' || p.role === 'AllRounder')
    .sort((a, b) => b.bowlingRating - a.bowlingRating || b.bowl.wickets - a.bowl.wickets)
    .slice(0, 10);
  topBowlers.forEach((p, i) => {
    console.log(`${i + 1}. ${p.name} [${p.squad}] - Rating: ${p.bowlingRating} (Wkts: ${p.bowl.wickets}, Econ: ${p.bowl.econ}, Avg: ${p.bowl.avg}, BigMatchWkts: ${p.bowl.bigMatchWickets})`);
  });

  console.log(`\n--- TOP ALL-ROUNDERS (60-99) ---`);
  const topAllRounders = [...allCards]
    .filter(p => p.role === 'AllRounder')
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 6);
  topAllRounders.forEach((p, i) => {
    console.log(`${i + 1}. ${p.name} [${p.squad}] - Cost: ${p.cost} (Bat Rating: ${p.battingRating}, Bowl Rating: ${p.bowlingRating})`);
  });

  console.log(`\n====================================================================\n`);
}

// Auto-run if executed directly
const rawDataDir = path.resolve(__dirname, 'raw_data');
const outputFile = path.resolve(__dirname, '../src/data/squads.json');
generateSquads(rawDataDir, outputFile);
