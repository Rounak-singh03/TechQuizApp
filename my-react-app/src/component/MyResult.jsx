import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { resultStyles } from '../assets/dummyStyle';
import axios from 'axios';
import { toast } from 'react-toastify';

// Badge component
const Badge = ({ percent }) => {
    if (percent >= 85) return <span className={resultStyles.badgeExcellent}>Excellent</span>;
    if (percent >= 65) return <span className={resultStyles.badgeGood}>Good</span>;
    if (percent >= 45) return <span className={resultStyles.badgeAverage}>Average</span>;
    return <span className={resultStyles.badgeNeedsWork}>Needs Work</span>;
};

const MyResult = ({ apiBase = "https://techquizapp-1.onrender.com" }) => {
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTechnology, setSelectedTechnology] = useState("all");
    const [technologies, setTechnologies] = useState([]);

    // Token for auth
    const getAuthHeader = useCallback(() => {
        const token = localStorage.getItem("token") || localStorage.getItem("authToken") || null;
        return token ? { Authorization: `Bearer ${token}` } : {};
    }, []);

    // Fetch results based on selected technology
    useEffect(() => {
        let mounted = true;
        const fetchResults = async (tech = "all") => {
            setLoading(true);
            setError(null);
            try {
                const q = tech && tech.toLowerCase() !== "all" ? `?technology=${encodeURIComponent(tech)}` : "";
                const res = await axios.get(`${apiBase}/api/results${q}`, {
                    headers: { "Content-Type": "application/json", ...getAuthHeader() },
                    timeout: 10000,
                });
                if (!mounted) return;
                if (res.status === 200 && res.data && res.data.success) {
                    setResults(Array.isArray(res.data.results) ? res.data.results : []);
                } else {
                    setResults([]);
                    toast.warn("Unexpected server response while fetching results.");
                }
            } catch (err) {
                console.error("Failed to fetch results:", err?.response?.data || err.message || err);
                if (!mounted) return;
                if (err?.response?.status === 401) {
                    setError("Not authenticated. Please log in to view results.");
                    toast.error("Not authenticated. Please login.");
                } else {
                    setError("Could not load results from server.");
                    toast.error("Could not load results from server.");
                    setResults([]);
                }
            } finally {
                if (mounted) setLoading(false);
            }
        };
        fetchResults(selectedTechnology);
        return () => { mounted = false; };
    }, [apiBase, selectedTechnology, getAuthHeader]);

    // Fetch technologies once
    useEffect(() => {
        let mounted = true;
        const fetchAllForTechList = async () => {
            try {
                const res = await axios.get(`${apiBase}/api/results`, {
                    headers: { "Content-Type": "application/json", ...getAuthHeader() },
                    timeout: 10000,
                });
                if (!mounted) return;
                if (res.status === 200 && res.data && res.data.success) {
                    const all = Array.isArray(res.data.results) ? res.data.results : [];
                    const set = new Set();
                    all.forEach(r => { if (r.technology) set.add(r.technology); });
                    const arr = Array.from(set).sort((a, b) => a.localeCompare(b));
                    setTechnologies(arr);
                }
            } catch (err) {
                console.error("Failed to fetch technologies:", err?.response?.data || err.message || err);
            }
        };
        fetchAllForTechList();
        return () => { mounted = false; };
    }, [apiBase, getAuthHeader]);

    const makeKey = (r) => (r && r._id ? r._id : `${r.id}||${r.title}`);

    // Group results by first word of title
    const grouped = useMemo(() => {
        const src = Array.isArray(results) ? results : [];
        const map = {};
        src.forEach(r => {
            const track = (r.title || "").split(" ")[0] || "General";
            if (!map[track]) map[track] = [];
            map[track].push(r);
        });
        return map;
    }, [results]);

    const handleSelectTech = (tech) => { setSelectedTechnology(tech || "all"); };

    return (
        <div className={resultStyles.pageContainer}>
            <div className={resultStyles.container}>
                <header className={resultStyles.header}>
                    <h1 className={resultStyles.title}>Quiz Results</h1>
                    <div className={resultStyles.headerControls} />
                </header>

                {/* Filter Buttons */}
                <div className={resultStyles.filterContainer}>
                    <div className={resultStyles.filterContent}>
                        <span className={resultStyles.filterLabel}>Filter by tech:</span>
                        <div className={resultStyles.filterButtonsContainer}>
                            <button onClick={() => handleSelectTech("all")}
                                className={`${resultStyles.filterButton} ${selectedTechnology === "all"
                                    ? resultStyles.filterButtonActive
                                    : resultStyles.filterButtonInactive}`}>
                                All
                            </button>

                            {technologies.map((tech) => (
                                <button key={tech} onClick={() => handleSelectTech(tech)}
                                    className={`${resultStyles.filterButton} ${selectedTechnology === tech
                                        ? resultStyles.filterButtonActive
                                        : resultStyles.filterButtonInactive}`}>
                                    {tech}
                                </button>
                            ))}
                        </div>

                        <div className={resultStyles.filterStatus}>
                            {selectedTechnology === "all" ? "Showing all technologies" : `Filtering: ${selectedTechnology}`}
                        </div>
                    </div>
                </div>

                {/* Loading / Results */}
                {loading ? (
                    <div className={resultStyles.loadingContainer}>
                        <div className={resultStyles.loadingSpinner} />
                        <div className={resultStyles.loadingText}>Loading results...</div>
                    </div>
                ) : (
                    <>
                        {Object.entries(grouped).map(([track, items]) => (
                            <section key={track} className={resultStyles.trackSection}>
                                <h2 className={resultStyles.trackTitle}>{track} Track</h2>
                                <div className={resultStyles.resultsGrid}>
                                    {items.map((r) => <StripCard key={makeKey(r)} item={r} />)}
                                </div>
                            </section>
                        ))}

                        {Array.isArray(results) && results.length === 0 && !error && (
                            <div className={resultStyles.emptyState}>
                                No results yet. Take a quiz to see results here.
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

// StripCard component
function StripCard({ item }) {
    const percent = item.totalQuestions ? Math.round((Number(item.correct) / Number(item.totalQuestions)) * 100) : 0;

    const getLevel = (it) => {
        const id = (it.id || "").toString().toLowerCase();
        const title = (it.title || "").toString().toLowerCase();
        if (id.includes("basic") || title.includes(" basic")) return { letter: "B", style: resultStyles.levelBasic };
        if (id.includes("intermediate") || title.includes(" intermediate")) return { letter: "I", style: resultStyles.levelIntermediate };
        return { letter: "A", style: resultStyles.levelAdvanced };
    };

    const level = getLevel(item);

    return (
        <article className={resultStyles.card}>
            <div className={resultStyles.cardAccent}></div>
            <div className={resultStyles.cardContent}>
                <div className={resultStyles.cardHeader}>
                    <div className={resultStyles.cardInfo}>
                        <div className={`${resultStyles.levelAvatar} ${level.style}`}>
                            {level.letter}
                        </div>

                        <div className={resultStyles.cardText}>
                            <h3 className={resultStyles.cardTitle}>
                                {item.title}
                            </h3>
                            <div className={resultStyles.cardMeta}>{item.totalQuestions} Qs
                                                                        {item.timeSpent ? ` • ${item.timeSpent}` : ""}
                            </div>
                        </div>
                    </div>

                    <div className={resultStyles.cardPerformance}>
                        <div className={resultStyles.performanceLabel}>Performance</div>
                        <div className={resultStyles.badgeContainer}>
                            <Badge percent={percent}/>
                        </div>
                    </div>
                </div>
                <div className={resultStyles.cardStats}>
                    <div className={resultStyles.statItem}>
                        Correct:
                    <span className={resultStyles.statNumber}>{item.correct}</span>
                     </div>

                      <div className={resultStyles.statItem}>
                        Wrong:
                    <span className={resultStyles.statNumber}>{item.wrong}</span>
                     </div>

                      <div className={resultStyles.statItem}>
                        Score:
                    <span className={resultStyles.statNumber}>{percent}%</span>
                     </div>
                </div>
              
            </div>
        </article>
    );
}

export default MyResult;
