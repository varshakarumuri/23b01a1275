import React, { useEffect, useState } from 'react';
import { fetchNotifications, logEvent } from "./api.js";
import { 
  Container, Typography, Card, CardContent, Badge, Box, 
  CircularProgress, Alert, Tabs, Tab, TextField, MenuItem, Button 
} from '@mui/material';

const WEIGHT_MAP = { "Placement": 3, "Result": 2, "Event": 1 };

function App() {
  const [allRawNotifications, setAllRawNotifications] = useState([]);
  const [displayedNotifications, setDisplayedNotifications] = useState([]);
  const [readStatus, setReadStatus] = useState({}); // Tracking read/unread state locally
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Controls controls
  const [currentTab, setCurrentTab] = useState(0); // 0 = All, 1 = Priority Inbox
  const [limit, setLimit] = useState(10); // Default "n" limit
  const [typeFilter, setTypeFilter] = useState('All');

  useEffect(() => {
    async function loadData() {
      try {
        await logEvent("info", "page", "Main dashboard rendered");
        const rawData = await fetchNotifications();
        setAllRawNotifications(rawData);
        await logEvent("info", "state", "Fetched notifications successfully committed to state");
      } catch (err) {
        setError("Could not load notifications.");
        await logEvent("fatal", "state", `Data read exception: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Central Processing Filter & Sorting Algorithm
  useEffect(() => {
    let targetList = [...allRawNotifications];

    // 1. Filter by Notification Category Type if selected
    if (typeFilter !== 'All') {
      targetList = targetList.filter(item => item.Type === typeFilter);
    }

    // 2. Compute Priority Scoring engine if Priority Inbox Tab is active
    if (currentTab === 1) {
      targetList = targetList.map(item => {
        const typeWeight = WEIGHT_MAP[item.Type] || 0;
        const recencyScore = new Date(item.Timestamp).getTime();
        const finalScore = (typeWeight * 1000000000000) + recencyScore;
        return { ...item, score: finalScore };
      });
      
      // Sort descending by calculated algorithm metrics
      targetList.sort((a, b) => b.score - a.score);
    } else {
      // Standard view simply sorts strictly chronologically
      targetList.sort((a, b) => new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime());
    }

    // 3. Slice boundaries by user custom "n" limit
    setDisplayedNotifications(targetList.slice(0, limit));
  }, [allRawNotifications, currentTab, limit, typeFilter]);

  const toggleReadStatus = async (id) => {
    setReadStatus(prev => ({ ...prev, [id]: true }));
    await logEvent("debug", "component", `Notification ID ${id} flagged as read`);
  };

  const getBadgeColor = (type) => {
    if (type === 'Placement') return 'error';
    if (type === 'Result') return 'secondary';
    return 'primary';
  };

  return (
    <Container maxWidth="md" style={{ marginTop: '2rem', marginBottom: '2rem' }}>
      <Typography variant="h4" gutterBottom style={{ fontWeight: 'bold', color: '#1a237e' }}>
        Campus Notifications Platform
      </Typography>

      {/* Navigation View Switcher tabs */}
      <Tabs value={currentTab} onChange={(e, val) => setCurrentTab(val)} style={{ marginBottom: '1.5rem' }}>
        <Tab label="All Notifications" />
        <Tab label="Priority Inbox" />
      </Tabs>

      {/* Interactive Operational Filters Box */}
      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        <TextField
          label="Display Limit (n)"
          type="number"
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
          size="small"
          style={{ width: '150px' }}
        />
        <TextField
          select
          label="Filter Type"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          size="small"
          style={{ width: '180px' }}
        >
          <MenuItem value="All">All Types</MenuItem>
          <MenuItem value="Placement">Placements</MenuItem>
          <MenuItem value="Result">Results</MenuItem>
          <MenuItem value="Event">Events</MenuItem>
        </TextField>
      </Box>

      {loading && (
        <Box display="flex" justifyContent="center" my={4}><CircularProgress /></Box>
      )}

      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && (
        <Box display="flex" flexDirection="column" gap={2}>
          {displayedNotifications.map((notif) => {
            const isRead = readStatus[notif.ID];
            return (
              <Card 
                key={notif.ID} 
                variant="outlined" 
                onClick={() => toggleReadStatus(notif.ID)}
                style={{ 
                  borderRadius: '8px', 
                  cursor: 'pointer',
                  borderLeft: isRead ? '1px solid #ccc' : '5px solid #2196f3', // New blue anchor strip indicates New/Unread status
                  backgroundColor: isRead ? '#fcfcfc' : '#ffffff'
                }}
              >
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1} flexWrap="wrap" gap={1}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Box sx={{ minWidth: '90px' }}>
                        <Badge 
                          badgeContent={notif.Type} 
                          color={getBadgeColor(notif.Type)} 
                          sx={{ '& .MuiBadge-badge': { position: 'static', transform: 'none' } }} 
                        />
                      </Box>
                      {!isRead && <Typography variant="caption" style={{ color: '#2196f3', fontWeight: 'bold' }}>● NEW</Typography>}
                    </Box>
                    <Typography variant="caption" color="textSecondary">
                      {new Date(notif.Timestamp).toLocaleString()}
                    </Typography>
                  </Box>
                  <Typography variant="body1" style={{ fontWeight: isRead ? 400 : 600, color: '#2c3e50' }}>
                    {notif.Message}
                  </Typography>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}
    </Container>
  );
}

export default App;