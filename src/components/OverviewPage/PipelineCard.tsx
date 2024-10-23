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
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setActivePipeline } from '../../redux/slices/pipelineSlice';

export interface PipelineCardProps {
  id: string;
  name: string;
  imgData: string;
  status: string;
  output: string; // Pipeline output text
}

export default function MediaCard({ id, name, imgData, status, output }: PipelineCardProps) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [open, setOpen] = React.useState(false);  // State to control dialog open/close

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

  // Function to handle downloading the pipeline output as a .txt file
  const downloadOutputAsText = () => {
    const blob = new Blob([output], { type: 'text/plain' }); // Create a Blob from the output text
    const link = document.createElement('a'); // Create a temporary anchor element
    link.href = URL.createObjectURL(blob); // Create an object URL for the blob
    link.download = `${name}_output.txt`; // Set the filename
    link.click(); // Trigger the download
    URL.revokeObjectURL(link.href); // Clean up the object URL
  };

  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardActionArea onClick={navigateToPipeline}>
        <CardMedia
          sx={{ height: 140 }}
          title={name}
          image={imgData}
        />
        <CardContent>
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
          {(status === 'faulty' || status === 'completed') && (
            <Button size="small" color="primary" onClick={handleDialogOpen}>
              View Output
            </Button>
          )}
        </CardActions>
      </CardActionArea>

      {/* Dialog to display the pipeline's output */}
      <Dialog open={open} onClose={handleDialogClose}>
        {/* <DialogTitle>Pipeline Output</DialogTitle> */}
        <DialogTitle>Pipeline Output: {name}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {output}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={downloadOutputAsText} color="primary">
            Download as .txt
          </Button>
          <Button onClick={handleDialogClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );

  
}