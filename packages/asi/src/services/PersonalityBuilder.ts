import { EventEmitter } from 'eventemitter3';
import { logger } from '../utils/logger';

/**
 * PersonalityBuilder extracts personality traits from EEG data
 * Uses neuroscience research to map brain patterns to personality
 */
export class PersonalityBuilder extends EventEmitter {
  private config: any;

  constructor(config: any) {
    super();
    this.config = config;
  }

  async extractFromEEG(eegData: any) {
    logger.info('Extracting personality from EEG data');

    // Process raw EEG channels
    const processedEEG = this.processRawEEG(eegData);

    // Extract frequency bands
    const frequencyBands = this.extractFrequencyBands(processedEEG);

    // Calculate neural markers
    const neuralMarkers = this.calculateNeuralMarkers(frequencyBands);

    // Map to personality traits
    const personality = this.mapToPersonality(neuralMarkers);

    this.emit('personality:extracted', personality);

    return personality;
  }

  private processRawEEG(eegData: any) {
    // Process 8-16 channel EEG data
    const channels = eegData.channels || [];
    const sampleRate = eegData.sampleRate || 250; // Hz

    // Calculate channel statistics
    const channelStats = channels.map((channel: any) => ({
      mean: this.calculateMean(channel.data),
      variance: this.calculateVariance(channel.data),
      power: this.calculatePower(channel.data),
      complexity: this.calculateComplexity(channel.data)
    }));

    return {
      channels: channelStats,
      sampleRate,
      duration: eegData.duration,
      timestamp: eegData.timestamp
    };
  }

  private extractFrequencyBands(processedEEG: any) {
    // Extract standard EEG frequency bands
    // These calculations are simplified - in production, use FFT

    return {
      delta: this.extractBand(processedEEG, 0.5, 4),    // Deep sleep, unconscious
      theta: this.extractBand(processedEEG, 4, 8),      // Creativity, intuition
      alpha: this.extractBand(processedEEG, 8, 13),     // Relaxation, reflection
      beta: this.extractBand(processedEEG, 13, 30),     // Active thinking, focus
      gamma: this.extractBand(processedEEG, 30, 100)    // Higher cognitive functions
    };
  }

  private extractBand(data: any, lowFreq: number, highFreq: number) {
    // Simplified band power calculation
    // In production, use proper FFT and bandpass filtering

    const power = Math.random() * 0.5 + 0.3; // Simulated power
    const asymmetry = Math.random() * 2 - 1; // -1 to 1

    return {
      power,
      asymmetry,
      dominantFrequency: lowFreq + Math.random() * (highFreq - lowFreq),
      coherence: Math.random(),
      phase: Math.random() * Math.PI * 2
    };
  }

  private calculateNeuralMarkers(frequencyBands: any) {
    // Calculate personality-relevant neural markers based on research

    return {
      // Frontal Alpha Asymmetry (approach/withdrawal motivation)
      frontalAlphaAsymmetry: this.calculateFrontalAsymmetry(frequencyBands.alpha),

      // Beta/Alpha ratio (arousal level)
      arousalLevel: frequencyBands.beta.power / (frequencyBands.alpha.power + 0.001),

      // Theta/Beta ratio (attention and impulsivity)
      attentionIndex: frequencyBands.theta.power / (frequencyBands.beta.power + 0.001),

      // Gamma power (cognitive processing)
      cognitiveProcessing: frequencyBands.gamma.power,

      // Alpha peak frequency (cognitive flexibility)
      alphaPeakFrequency: frequencyBands.alpha.dominantFrequency,

      // Cross-frequency coupling (neural integration)
      neuralIntegration: this.calculateCrossFrequencyCoupling(frequencyBands),

      // Complexity measures
      neuralComplexity: this.calculateNeuralComplexity(frequencyBands),

      // Emotional processing markers
      emotionalMarkers: {
        valence: this.calculateEmotionalValence(frequencyBands),
        arousal: this.calculateEmotionalArousal(frequencyBands),
        regulation: this.calculateEmotionRegulation(frequencyBands)
      }
    };
  }

  private mapToPersonality(neuralMarkers: any) {
    // Map neural markers to Big Five personality traits
    // Based on neuroscience research

    const personality = {
      // Openness: Associated with alpha frequency and neural complexity
      openness: this.calculateOpenness(neuralMarkers),

      // Conscientiousness: Related to beta activity and attention
      conscientiousness: this.calculateConscientiousness(neuralMarkers),

      // Extraversion: Linked to frontal alpha asymmetry
      extraversion: this.calculateExtraversion(neuralMarkers),

      // Agreeableness: Connected to emotional regulation
      agreeableness: this.calculateAgreeableness(neuralMarkers),

      // Neuroticism: Related to arousal and emotional instability
      neuroticism: this.calculateNeuroticism(neuralMarkers),

      // Additional personality dimensions
      creativity: this.calculateCreativity(neuralMarkers),
      emotionalIntelligence: this.calculateEmotionalIntelligence(neuralMarkers),
      cognitiveFlexibility: this.calculateCognitiveFlexibility(neuralMarkers),
      socialSensitivity: this.calculateSocialSensitivity(neuralMarkers),
      stressResilience: this.calculateStressResilience(neuralMarkers),

      // Neural signature for matching
      neuralSignature: {
        alphaAsymmetry: neuralMarkers.frontalAlphaAsymmetry,
        arousalBaseline: neuralMarkers.arousalLevel,
        cognitiveStyle: this.determineCognitiveStyle(neuralMarkers),
        emotionalProfile: neuralMarkers.emotionalMarkers
      },

      // Relationship-relevant traits
      attachmentStyle: this.inferAttachmentStyle(neuralMarkers),
      communicationPreference: this.inferCommunicationPreference(neuralMarkers),
      intimacyComfort: this.calculateIntimacyComfort(neuralMarkers),
      conflictStyle: this.inferConflictStyle(neuralMarkers),

      // Metadata
      confidence: this.calculateConfidence(neuralMarkers),
      source: 'eeg',
      timestamp: new Date().toISOString()
    };

    return personality;
  }

  // Personality calculation methods based on neuroscience research

  private calculateOpenness(markers: any): number {
    // High alpha power and complexity = openness to experience
    const alphaPower = markers.alphaPeakFrequency / 13; // Normalize
    const complexity = markers.neuralComplexity;
    const flexibility = markers.cognitiveProcessing;

    return Math.min(0.3 + alphaPower * 0.3 + complexity * 0.2 + flexibility * 0.2, 1);
  }

  private calculateConscientiousness(markers: any): number {
    // Beta activity and low theta/beta ratio = conscientiousness
    const betaFocus = 1 / (1 + markers.attentionIndex); // Inverse of theta/beta
    const arousal = Math.min(markers.arousalLevel / 2, 1);

    return Math.min(0.3 + betaFocus * 0.4 + arousal * 0.3, 1);
  }

  private calculateExtraversion(markers: any): number {
    // Left frontal dominance = approach motivation = extraversion
    const frontalAsymmetry = (markers.frontalAlphaAsymmetry + 1) / 2; // Normalize to 0-1
    const arousal = Math.min(markers.arousalLevel / 2, 1);

    return Math.min(0.2 + frontalAsymmetry * 0.5 + arousal * 0.3, 1);
  }

  private calculateAgreeableness(markers: any): number {
    // Emotional regulation and positive valence = agreeableness
    const emotionReg = markers.emotionalMarkers.regulation;
    const positiveValence = (markers.emotionalMarkers.valence + 1) / 2;

    return Math.min(0.3 + emotionReg * 0.4 + positiveValence * 0.3, 1);
  }

  private calculateNeuroticism(markers: any): number {
    // High arousal, negative valence, poor regulation = neuroticism
    const highArousal = markers.emotionalMarkers.arousal;
    const negativeValence = (1 - (markers.emotionalMarkers.valence + 1) / 2);
    const poorRegulation = 1 - markers.emotionalMarkers.regulation;

    return Math.min(0.1 + highArousal * 0.3 + negativeValence * 0.3 + poorRegulation * 0.3, 0.8);
  }

  private calculateCreativity(markers: any): number {
    // Alpha power, theta activity, neural complexity
    const alpha = markers.alphaPeakFrequency / 13;
    const complexity = markers.neuralComplexity;
    const integration = markers.neuralIntegration;

    return Math.min(0.2 + alpha * 0.3 + complexity * 0.3 + integration * 0.2, 1);
  }

  private calculateEmotionalIntelligence(markers: any): number {
    const regulation = markers.emotionalMarkers.regulation;
    const complexity = markers.neuralComplexity;
    const integration = markers.neuralIntegration;

    return Math.min(0.2 + regulation * 0.4 + complexity * 0.2 + integration * 0.2, 1);
  }

  private calculateCognitiveFlexibility(markers: any): number {
    const alphaPeak = markers.alphaPeakFrequency / 13;
    const gamma = markers.cognitiveProcessing;
    const integration = markers.neuralIntegration;

    return Math.min(0.3 + alphaPeak * 0.3 + gamma * 0.2 + integration * 0.2, 1);
  }

  private calculateSocialSensitivity(markers: any): number {
    // Mirror neuron activity would be in mu rhythm (8-13 Hz over sensorimotor)
    // Simplified calculation
    return Math.min(0.4 + markers.emotionalMarkers.regulation * 0.3 + markers.neuralIntegration * 0.3, 1);
  }

  private calculateStressResilience(markers: any): number {
    const lowArousal = 1 - markers.emotionalMarkers.arousal;
    const regulation = markers.emotionalMarkers.regulation;
    const alphapower = markers.alphaPeakFrequency / 13;

    return Math.min(0.2 + lowArousal * 0.3 + regulation * 0.3 + alphapower * 0.2, 1);
  }

  private calculateIntimacyComfort(markers: any): number {
    const attachment = markers.frontalAlphaAsymmetry > 0 ? 0.7 : 0.4;
    const regulation = markers.emotionalMarkers.regulation;

    return Math.min(0.3 + attachment * 0.4 + regulation * 0.3, 1);
  }

  private determineCognitiveStyle(markers: any): string {
    if (markers.cognitiveProcessing > 0.7 && markers.neuralComplexity > 0.6) {
      return 'analytical-complex';
    } else if (markers.alphaPeakFrequency > 10 && markers.neuralIntegration > 0.6) {
      return 'intuitive-holistic';
    } else if (markers.arousalLevel > 1.5) {
      return 'focused-detail';
    } else {
      return 'balanced-adaptive';
    }
  }

  private inferAttachmentStyle(markers: any): string {
    const asymmetry = markers.frontalAlphaAsymmetry;
    const arousal = markers.emotionalMarkers.arousal;
    const regulation = markers.emotionalMarkers.regulation;

    if (asymmetry > 0.2 && regulation > 0.6) {
      return 'secure';
    } else if (arousal > 0.7 && regulation < 0.4) {
      return 'anxious';
    } else if (asymmetry < -0.2 && arousal < 0.3) {
      return 'avoidant';
    } else {
      return 'fearful-avoidant';
    }
  }

  private inferCommunicationPreference(markers: any): string {
    if (markers.cognitiveProcessing > 0.6) {
      return 'verbal-analytical';
    } else if (markers.emotionalMarkers.valence > 0.3) {
      return 'emotional-expressive';
    } else {
      return 'balanced';
    }
  }

  private inferConflictStyle(markers: any): string {
    const arousal = markers.emotionalMarkers.arousal;
    const regulation = markers.emotionalMarkers.regulation;

    if (regulation > 0.7) {
      return 'collaborative';
    } else if (arousal > 0.7) {
      return 'confrontational';
    } else if (arousal < 0.3) {
      return 'avoidant';
    } else {
      return 'compromising';
    }
  }

  private calculateConfidence(markers: any): number {
    // Confidence in the personality extraction
    // Based on signal quality and consistency

    const signalQuality = Math.random() * 0.3 + 0.6; // Simulated
    const consistency = Math.random() * 0.2 + 0.7; // Simulated

    return (signalQuality + consistency) / 2;
  }

  // Helper methods

  private calculateFrontalAsymmetry(alphaBand: any): number {
    // Left - Right frontal alpha
    // Positive = left dominance (approach), Negative = right dominance (withdrawal)
    return alphaBand.asymmetry;
  }

  private calculateCrossFrequencyCoupling(bands: any): number {
    // Measure of how different frequency bands interact
    // Important for neural integration
    return Math.random() * 0.4 + 0.4; // Simplified
  }

  private calculateNeuralComplexity(bands: any): number {
    // Entropy and complexity of neural signals
    let complexity = 0;
    Object.values(bands).forEach((band: any) => {
      complexity += band.coherence * band.power;
    });
    return Math.min(complexity / 5, 1);
  }

  private calculateEmotionalValence(bands: any): number {
    // Positive vs negative emotion (-1 to 1)
    return bands.alpha.asymmetry * 0.5 + (bands.beta.power - 0.5);
  }

  private calculateEmotionalArousal(bands: any): number {
    // Level of emotional activation (0 to 1)
    return Math.min(bands.beta.power + bands.gamma.power * 0.5, 1);
  }

  private calculateEmotionRegulation(bands: any): number {
    // Ability to regulate emotions (0 to 1)
    const alphaControl = bands.alpha.power;
    const betaBalance = 1 - Math.abs(bands.beta.power - 0.5) * 2;

    return (alphaControl + betaBalance) / 2;
  }

  private calculateMean(data: number[]): number {
    return data.reduce((a, b) => a + b, 0) / data.length;
  }

  private calculateVariance(data: number[]): number {
    const mean = this.calculateMean(data);
    return data.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / data.length;
  }

  private calculatePower(data: number[]): number {
    return data.reduce((sum, x) => sum + x * x, 0) / data.length;
  }

  private calculateComplexity(data: number[]): number {
    // Simplified complexity measure
    const variance = this.calculateVariance(data);
    return Math.min(variance / 100, 1);
  }
}