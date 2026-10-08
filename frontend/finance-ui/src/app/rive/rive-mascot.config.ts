/**
 * Names taken from finance-mascot.riv.
 * Replace these if you author a dedicated login state machine.
 */
export const RIVE_MASCOT = {
  src: '/assets/rive/finance-mascot.riv',
  wasmUrl: '/rive.wasm',
  wasmFallbackUrl: '/rive_fallback.wasm',
  artboard: 'Landing Artboard',
  stateMachine: 'State Machine 1',
  viewModel: 'ViewModel1',
  properties: {
    emailFocus: 'isReading',
    passwordFocus: 'isTakingnotes',
    loading: 'isReloading',
    successTrigger: 'winTrigger',
    financialStates: 'financialStates',
    wrongAnswers: 'wrongAnswers',
  },
  financialStateValues: {
    idle: 'Neutral F State',
    success: 'Good F State',
    failure: 'Bad F State',
  },
  wrongAnswerValue: 'Wrong Answer 01',
} as const;
