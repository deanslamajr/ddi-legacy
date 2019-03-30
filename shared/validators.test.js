import {
  ERR_MUST_BE_A_NUMBER,
  ERR_CANNOT_BE_NEGATIVE,
  validateId,
  validateStudioState,
  validateTitle
} from './validators'

describe('validators', () => {
  const validStudioState = {
    activeEmojiId: 1,
    currentEmojiId: 2,
    emojis: 
     { '1': 
        { emoji: '🈵',
          id: 1,
          order: 1,
          x: 100,
          y: 100,
          scaleX: 1,
          scaleY: 1,
          rotation: 0,
          size: 100,
          alpha: 0.5,
          red: 126,
          green: 0,
          blue: 0 } },
    showEmojiPicker: false,
    title: ''
  }

  describe('validateTitle', () => {
    describe('if value is longer than 255 characters', () => {
      it('should be clipped to the first 255 characters', () => {
        const tooLongTitle = 'PMjiGzHtLxMUns5ZhbIlaoogREylI8DEDRBQclE9H62ZAOoKifQj054UArwLSly69oECbNeCSiq0PAwJz02qE35jFjYB7WCvuM77zmFKbldhYcmxidffi8u4OQGHarXcn5FFY28oTufNYuk2cLgnXaEoN6PU2u20ci3Cm2iHxD1NljRjhfHuj9hWxzu7YZbmoS5LtRzBwwMJ3tYSeEeqAqcTc7a2SqXenBTTVW2zi8WS9gmxMmQsPD0pb6mJHY6X'
        const validatedTitle = validateTitle(tooLongTitle)
        expect(validatedTitle.length).toEqual(255)
      })
    })
  })

  describe('validateId', () => {
    const SOME_FIELD = 'SOME_FIELD'

    describe('if not a Number type', () => {
      it('should throw ERR_MUST_BE_A_NUMBER', () => {
        expect(() => {
          validateId('not a number type', SOME_FIELD);
        }).toThrow(`${SOME_FIELD} ${ERR_MUST_BE_A_NUMBER}`)
      })
    })

    describe('if less than 0', () => {
      it('should throw ERR_CANNOT_BE_NEGATIVE', () => {
        expect(() => {
          validateId(-1, SOME_FIELD);
        }).toThrow(`${SOME_FIELD} ${ERR_CANNOT_BE_NEGATIVE}`)
      })
    })
  })

  describe('validateStudioState', () => {
    describe('activeEmojiId', () => {
      describe('if not a Number type', () => {
        it('should throw ERR_MUST_BE_A_NUMBER', () => {
          const incorrectStudioState = {
            ...validStudioState,
            activeEmojiId: 'taco'
          }

          expect(() => {
            validateStudioState(incorrectStudioState);
          }).toThrow(`activeEmojiId ${ERR_MUST_BE_A_NUMBER}`)
        })
      })

      describe('if negative value', () => {
        it('should throw ERR_CANNOT_BE_NEGATIVE', () => {
          const incorrectStudioState = {
            ...validStudioState,
            activeEmojiId: -1
          }

          expect(() => {
            validateStudioState(incorrectStudioState);
          }).toThrow(`activeEmojiId ${ERR_CANNOT_BE_NEGATIVE}`)
        })
      })
    })

    describe('currentEmojiId', () => {
      describe('if not a Number type', () => {
        it('should throw ERR_MUST_BE_A_NUMBER', () => {
          const incorrectStudioState = {
            ...validStudioState,
            currentEmojiId: 'taco'
          }

          expect(() => {
            validateStudioState(incorrectStudioState)
          }).toThrow(`currentEmojiId ${ERR_MUST_BE_A_NUMBER}`)
        })
      })

      describe('if negative value', () => {
        it('should throw ERR_CANNOT_BE_NEGATIVE', () => {
          const incorrectStudioState = {
            ...validStudioState,
            currentEmojiId: -1
          }

          expect(() => {
            validateStudioState(incorrectStudioState)
          }).toThrow(`currentEmojiId ${ERR_CANNOT_BE_NEGATIVE}`)
        })
      })
    })

    describe('showEmojiPicker', () => {
      describe('if not a Boolean type', () => {
        it('should be coerced into a boolean type', () => {
          expect.assertions(2)

          const incorrectStudioState = {
            ...validStudioState,
            showEmojiPicker: -1
          }

          const validatedStudioState = validateStudioState(incorrectStudioState)

          expect(validatedStudioState.showEmojiPicker).not.toEqual(-1)
          expect(validatedStudioState.showEmojiPicker).toEqual(true)
        })
      })
    })

    describe('title', () => {
      describe('if title is longer than 255 characters', () => {
        it('should be clipped to the first 255 characters', () => {
          const tooLongTitle = 'PMjiGzHtLxMUns5ZhbIlaoogREylI8DEDRBQclE9H62ZAOoKifQj054UArwLSly69oECbNeCSiq0PAwJz02qE35jFjYB7WCvuM77zmFKbldhYcmxidffi8u4OQGHarXcn5FFY28oTufNYuk2cLgnXaEoN6PU2u20ci3Cm2iHxD1NljRjhfHuj9hWxzu7YZbmoS5LtRzBwwMJ3tYSeEeqAqcTc7a2SqXenBTTVW2zi8WS9gmxMmQsPD0pb6mJHY6X'
          expect(tooLongTitle.length).toEqual(256)

          const incorrectStudioState = {
            ...validStudioState,
            title: tooLongTitle
          }

          const validatedStudioState = validateStudioState(incorrectStudioState)

          expect(validatedStudioState.title.length).toEqual(255)
        })
      })
    })
  })
})