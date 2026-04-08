/**
 * Alert Sound Service
 * A common component for playing notification/alert sounds throughout the app
 * Includes automatic vibration support - vibration starts and stops with sound
 * @module appAlertSound
 * @created 10-2-2026
 * @author vibin
 */

import Sound from 'react-native-sound';
import { Vibration } from 'react-native';

// silent mode
Sound.setCategory('Playback');

class AlertSoundService {
  constructor(soundFile = 'emergencynotification.wav') {
    this.soundFile = soundFile;
    this.sound = null;
    this.isLoaded = false;
    this.vibrationInterval = null;
    this.initSound();
  }

  initSound = () => {
    // console.log('Initializing alert sound with file:', this.soundFile);
    this.sound = new Sound(
      this.soundFile,
      Sound.MAIN_BUNDLE,
      (error) => {
        if (error) {
          // console.log('Failed to load alert sound:', error);
          this.isLoaded = false;
          return;
        }
        this.isLoaded = true;
        // console.log('Alert sound loaded successfully');
      }
    );
  };

  startVibration = () => {
    if (!this.vibrationInterval) {
      Vibration.vibrate(1000);
      this.vibrationInterval = setInterval(() => {
        Vibration.vibrate(1000);
      }, 1000);
      // console.log('Vibration started');
    }
  };

  stopVibration = () => {
    if (this.vibrationInterval) {
      clearInterval(this.vibrationInterval);
      this.vibrationInterval = null;
      Vibration.cancel();
      // console.log('Vibration stopped');
    }
  };


  start = (functionName) => {
    let withVibration = true;
      // console.log(`Start called on AlertSoundService with functionName-->>->: ${functionName.toString()}`);
    
    if (!this.sound || !this.isLoaded) {
      // console.warn('Alert sound not loaded yet');
      return;
    }

    if (!this.sound.isPlaying()) {
      // console.log('Starting alert sound');
      this.sound.setNumberOfLoops(-1);
      this.sound.play((success) => {
        if (success) {
          // console.log('Alert sound started successfully (infinite loop)');
        } else {
          // console.log('Alert sound failed to start');
        }
      });
      
      if (withVibration) {
        this.startVibration();
      }
    } else {
      // console.log('Alert sound is already playing');
    }
  };

  play = (onEnd = null, loops = -1, withVibration = true) => {
    if (!this.sound || !this.isLoaded) {
      console.warn('Alert sound not loaded yet');
      return;
    }

    //0 = play once, -1 = infinite
    this.sound.setNumberOfLoops(loops);

    this.sound.play((success) => {
      if (success) {
        // console.log('Alert sound played successfully');
      } else {
        // console.log('Alert sound playback failed due to audio decoding errors');
      }
      
      
      if (loops === 0) {
        this.stopVibration();
      }
      
      if (onEnd) {
        onEnd(success);
      }
    });
    
    
    if (withVibration) {
      this.startVibration();
    }
  };

  stop = () => {
    if (this.sound) {
      this.sound.stop(() => {
        // console.log('Alert sound stopped');
      });
    }
    this.stopVibration();
  };

  pause = () => {
    if (this.sound) {
      this.sound.pause();
      // console.log('Alert sound paused');
    }
    
    this.stopVibration();
  };

  setVolume = (volume) => {
    if (this.sound) {
      const clampedVolume = Math.max(0, Math.min(1, volume));
      this.sound.setVolume(clampedVolume);
      // console.log('Alert sound volume set to:', clampedVolume);
    }
  };

  isPlaying = () => {
    const soundPlaying = this.sound ? this.sound.isPlaying() : false;
    const vibrationActive = this.vibrationInterval !== null;
    return soundPlaying || vibrationActive;
  };


  reload = () => {
    this.initSound();
  };
}


const AlertSound = new AlertSoundService();
const AlertSoundFirst = new AlertSoundService('emergencynotification_first.wav');
// export default { AlertSound, AlertSoundFirst };
// export  { AlertSound, AlertSoundFirst };
export default { AlertSound, AlertSoundFirst }; 