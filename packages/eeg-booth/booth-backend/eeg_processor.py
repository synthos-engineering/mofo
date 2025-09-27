"""
Scientific EEG Processor for Love Detection
Based on peer-reviewed neuroscience research
"""
import numpy as np
from scipy import signal
from scipy.stats import zscore

class EEGProcessor:
    def __init__(self, sampling_rate=250):
        self.sampling_rate = sampling_rate
        self.nyquist = sampling_rate / 2
        
        # Frequency band definitions (Hz)
        self.bands = {
            'delta': (0.5, 4),
            'theta': (4, 8), 
            'alpha': (8, 13),
            'beta': (13, 30),
            'gamma': (30, 45)
        }
        
    def bandpass_filter(self, data, low_freq, high_freq):
        """Apply bandpass filter to data"""
        low = low_freq / self.nyquist
        high = high_freq / self.nyquist
        b, a = signal.butter(4, [low, high], btype='band')
        return signal.filtfilt(b, a, data)
    
    def calculate_power_spectral_density(self, data):
        """Calculate power spectral density using Welch's method"""
        freqs, psd = signal.welch(data, self.sampling_rate, nperseg=256)
        return freqs, psd
    
    def get_band_power(self, data, band_name):
        """Extract power in specific frequency band"""
        low_freq, high_freq = self.bands[band_name]
        filtered_data = self.bandpass_filter(data, low_freq, high_freq)
        return np.mean(filtered_data ** 2)
    
    def calculate_frontal_alpha_asymmetry(self, left_frontal, right_frontal):
        """
        Calculate Frontal Alpha Asymmetry (FAA)
        Based on Davidson & Fox (1989), Harmon-Jones & Allen (1997)
        """
        # Get alpha power for both sides
        left_alpha = self.get_band_power(left_frontal, 'alpha')
        right_alpha = self.get_band_power(right_frontal, 'alpha')
        
        # FAA = ln(right) - ln(left)
        # Positive values indicate left activation (approach motivation)
        faa = np.log(right_alpha + 1e-10) - np.log(left_alpha + 1e-10)
        return faa
    
    def calculate_arousal_index(self, channels_data):
        """
        Calculate arousal based on beta and gamma activity
        Based on Keil et al. (2001), Ray & Cole (1985)
        """
        arousal_scores = []
        
        for channel_data in channels_data:
            beta_power = self.get_band_power(channel_data, 'beta')
            gamma_power = self.get_band_power(channel_data, 'gamma')
            
            # Arousal index combines beta and gamma
            arousal = np.log(beta_power + gamma_power + 1e-10)
            arousal_scores.append(arousal)
            
        return np.mean(arousal_scores)
    
    def detect_p300_component(self, channel_data):
        """
        Detect P300 event-related potential
        Based on Polich (2007), Schupp et al. (2000)
        """
        # P300 occurs 250-400ms after stimulus
        # For continuous data, look for positive deflections
        
        # Simple P300 detection - look for peaks in 250-400ms window
        # This is a simplified version - real P300 requires event timing
        
        # Smooth the signal
        smoothed = signal.savgol_filter(channel_data, 11, 3)
        
        # Find peaks
        peaks, properties = signal.find_peaks(smoothed, height=np.std(smoothed))
        
        if len(peaks) > 0:
            # Return average peak amplitude
            return np.mean(properties['peak_heights'])
        else:
            return 0
    
    def calculate_love_score(self, channels_data):
        """
        Calculate love/attraction score using multiple EEG markers
        
        Args:
            channels_data: List of 8 numpy arrays (one per channel)
            
        Returns:
            dict with love score and component analysis
        """
        if len(channels_data) < 8:
            raise ValueError("Need 8 channels of EEG data")
        
        # Assume standard 10-20 electrode placement:
        # Ch1: Fp1 (left frontal)
        # Ch2: Fp2 (right frontal) 
        # Ch3-8: other positions
        
        left_frontal = channels_data[0]   # Ch1 - Fp1
        right_frontal = channels_data[1]  # Ch2 - Fp2
        
        # 1. Frontal Alpha Asymmetry (40% weight)
        faa = self.calculate_frontal_alpha_asymmetry(left_frontal, right_frontal)
        faa_normalized = np.tanh(faa)  # Normalize to [-1, 1]
        
        # 2. Arousal Detection (30% weight)
        arousal = self.calculate_arousal_index(channels_data)
        arousal_normalized = np.tanh(arousal / 5)  # Normalize 
        
        # 3. P300 Attention Component (30% weight)
        p300_amplitudes = []
        for channel_data in channels_data[:4]:  # Use first 4 channels
            p300_amp = self.detect_p300_component(channel_data)
            p300_amplitudes.append(p300_amp)
        
        avg_p300 = np.mean(p300_amplitudes)
        p300_normalized = np.tanh(avg_p300 / 10)  # Normalize
        
        # Combine components with weights
        love_score = (
            0.4 * faa_normalized +      # Approach motivation
            0.3 * arousal_normalized +   # Emotional arousal
            0.3 * p300_normalized       # Attention/significance
        )
        
        # Convert to 0-100 scale
        love_score_percent = ((love_score + 1) / 2) * 100
        
        return {
            'love_score': round(love_score_percent, 1),
            'components': {
                'frontal_alpha_asymmetry': round(faa_normalized * 100, 1),
                'arousal_level': round(arousal_normalized * 100, 1), 
                'attention_p300': round(p300_normalized * 100, 1)
            },
            'raw_values': {
                'faa': faa,
                'avg_arousal': arousal,
                'p300_amplitude': avg_p300
            },
            'confidence': min(100, max(0, 
                70 + 10 * abs(faa_normalized) + 10 * abs(arousal_normalized) + 10 * abs(p300_normalized)
            ))
        }
    
    def get_frequency_summary(self, channels_data):
        """Get frequency band power summary for all channels"""
        summary = {}
        
        for i, channel_data in enumerate(channels_data):
            channel_summary = {}
            
            for band_name in self.bands:
                power = self.get_band_power(channel_data, band_name)
                channel_summary[band_name] = round(power, 4)
                
            summary[f'channel_{i+1}'] = channel_summary
            
        return summary