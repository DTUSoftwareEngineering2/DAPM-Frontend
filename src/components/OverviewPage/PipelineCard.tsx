import * as React from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { CardActionArea, Box, Grid } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setActivePipeline } from '../../redux/slices/pipelineSlice';

export interface OutputFile {
  name: string; // File name, e.g., "raw_event_log.txt"
  content: string; // File content
}

export interface PipelineCardProps {
  id: string;
  name: string;
  imgData: string;
  status: string;
  outputs: OutputFile[]; // Array of output files
}

export default function MediaCard({ id, name, imgData, status, outputs }: PipelineCardProps) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [open, setOpen] = React.useState(false);  // State to control dialog open/close
  const [isPrivate, setIsPrivate] = React.useState(true);

  /* // Fetch pipeline visibility  from the backend
  useEffect(() => {
    // Fetch the pipeline visibility from the backend and update the state
    const fetchPipelineState = async () => {
      try {
        const response = await fetch('/api/pipeline/state');
        const data = await response.json();
        setIsPrivate(data.isPrivate);
      } catch (error) {
        console.error('Error fetching pipeline state:', error);
      }
    };
    fetchPipelineState();
  }, []);
  */

  const getLabelColor = () => {
    return isPrivate ? '#6F42C1' : '#28A745';
  };

  const navigateToPipeline = () => {
    dispatch(setActivePipeline(id));
    navigate('/pipeline');
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return '#4caf50'; // Green
      case 'faulty':
        return '#f44336'; // Red
      case 'running':
        return '#ff9800'; // Orange
      default:
        return '#9e9e9e'; // Grey
    }
  };

  const getLighterColor = (hex: string, percent: number): string => {
    // Convert hex to RGB
    let num = parseInt(hex.slice(1), 16);
    let r = (num >> 16) + Math.round((255 - (num >> 16)) * percent);
    let g = ((num >> 8) & 0x00FF) + Math.round((255 - ((num >> 8) & 0x00FF)) * percent);
    let b = (num & 0x0000FF) + Math.round((255 - (num & 0x0000FF)) * percent);
  
    // Clamp RGB values to stay within 0-255
    r = Math.min(255, Math.max(0, r));
    g = Math.min(255, Math.max(0, g));
    b = Math.min(255, Math.max(0, b));
  
    // Convert back to hex and return
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
  };

  const handleDialogOpen = (event: React.MouseEvent) => {
    event.stopPropagation();  // Prevent triggering the navigation when clicking the smaller button
    setOpen(true);
  };

  const handleDialogClose = () => {
    setOpen(false);
  };

  // Download a single output file
  const downloadFile = (fileName: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  // Download all files as separate .txt files
  const downloadAllFiles = () => {
    outputs.forEach(output => {
      downloadFile(output.name, output.content);
    });
  };

  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardActionArea onClick={navigateToPipeline}>
        <CardMedia sx={{ height: 140 }} title={name} image={imgData} />
        <CardContent>
          <Typography
            variant="body2"
            style={{
              position: 'absolute',
              top: 8,
              left: 8,
              color: 'white',
              backgroundColor: getLabelColor(),
              padding: '4px 8px',
              borderRadius: 4,
            }}
          >
            {isPrivate ? 'Private' : 'Public'}
          </Typography>
          <Typography gutterBottom variant="h5" component="div">
            {name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Click this to modify the pipeline
          </Typography>
        </CardContent>

        <CardActions sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Box
            sx={{
              width: 25,
              height: 25,
              borderRadius: '50%',
              backgroundColor: getStatusColor(status),
              border: `2.5px solid ${getLighterColor(getStatusColor(status), 0.7)}`, 
              boxShadow: '0 0 0 1px rgba(0,0,0,0.1)',
              zIndex: 2,
            }}
          />
          {(status.toLowerCase() === 'faulty' || status.toLowerCase() === 'completed') && (
            <Button size="small" color="primary" onClick={handleDialogOpen}>
              View Outputs
            </Button>
          )}
        </CardActions>
      </CardActionArea>

      {/* Dialog to display the pipeline's outputs */}
      <Dialog open={open} onClose={handleDialogClose}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Pipeline Outputs: {name}</Typography>
          <Button onClick={downloadAllFiles} color="primary" variant="outlined">
            Download All
          </Button>
        </DialogTitle>
        <DialogContent>
          {outputs.map((output, index) => (
            <Grid container key={index} alignItems="center" sx={{ mb: 1 }}>
              <Grid item xs={8}>
                <Typography>{output.name}</Typography>
              </Grid>
              <Grid item xs={4} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                  onClick={() => downloadFile(output.name, output.content)} 
                  color="primary"
                  variant="outlined"
                >
                  Download
                </Button>
              </Grid>
            </Grid>
          ))}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'flex-end' }}>
          <Button onClick={handleDialogClose} color="primary" variant="text">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}