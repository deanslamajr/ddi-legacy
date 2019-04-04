import cloneDeep from 'lodash/cloneDeep'

import {
  ERR_CANNOT_BE_NEGATIVE,
  ERR_INCORRECT_SCALE_VALUE,
  ERR_MUST_BE_A_NUMBER,
  ERR_MUST_BE_A_STRING,
  ERR_VALUE_MUST_BE_SET,
  validateEmojis,
  validateId,
  validateStudioState,
  validateTitle
} from './validators'

import {
  MIN_POSITION,
  MAX_POSITION
} from '../config/constants.json'

const validStudioState = {
  activeEmojiId: 1,
  currentEmojiId: 2,
  emojis: {
    '1': {
      emoji: '🦔',
      id: 1,
      order: 2,
      x: 15,
      y: 10,
      scaleX: 1,
      scaleY: 1,
      rotation: -48,
      size: 181,
      alpha: 0.5,
      red: 129.18999999999983,
      green: 0,
      blue: 0
    },
    '5': {
      emoji: '🦔',
      id: 5,
      order: 5,
      x: 8,
      y: 2,
      scaleX: 1,
      scaleY: 1,
      rotation: 0,
      size: 256,
      alpha: 0.88,
      red: 255.01,
      green: 255,
      blue: 255,
      filters: ['RGBA']
    },
  '6': {
      emoji: 'T',
      id: 6,
      order: 6,
      x: 34,
      y: 37,
      scaleX: 1,
      scaleY: 1,
      rotation: 0,
      size: 256,
      alpha: 0.5,
      red: 125.01,
      green: 0,
      blue: 0
    },
  '7': {
      emoji: '&',
      id: 7,
      order: 7,
      filters: ['RGBA'],
      x: 121,
      y: 84,
      scaleX: 1,
      scaleY: 1,
      rotation: 0,
      size: 100,
      alpha: 1,
      red: 257.01,
      green: 0,
      blue: 0
    }
  },
  showEmojiPicker: false,
  title: ''
}

describe('validators', () => {
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

    describe('emojis', () => {
      let emojis

      beforeEach(() => {
        emojis = cloneDeep(validStudioState.emojis)
      })

      it('should strip any unrecognized fields from the emojis object', () => {
        // add invalid field to each emoji
        Object.values(emojis).forEach(emoji => emoji.taco = 'taco')

        const validatedEmojis = validateEmojis(emojis)

        expect(validatedEmojis).toEqual(validStudioState.emojis)
      })

      it('should fail tests if emoji field is added to validator but validator tests havent been updated. This is a possible security issue: verify this new studio field has proper validations.', () => {
        const validatedEmojis = validateEmojis(emojis)
        const validatedEmojiKeys = Object.values(validatedEmojis).map(emoji => Object.keys(emoji).sort()) // sort to ignore array order
        const testDataEmojiKeys = Object.values(validStudioState.emojis).map(emoji => Object.keys(emoji).sort()) // sort to ignore array order
        expect(testDataEmojiKeys.sort()).toEqual(validatedEmojiKeys.sort()) // sort to ignore array order
      })

      describe('emoji.emoji', () => {
        it('should allow an emoji to pass', () => {
          Object.values(emojis).forEach(emoji => emoji.emoji = '🦔')
          const validatedEmojis = validateEmojis(emojis)
          const arrayOfEmojis = Object.values(validatedEmojis)
          expect(arrayOfEmojis[0].emoji).toEqual('🦔')
        })

        it('should allow a single char to pass', () => {
          Object.values(emojis).forEach(emoji => emoji.emoji = 'T')
          const validatedEmojis = validateEmojis(emojis)
          const arrayOfEmojis = Object.values(validatedEmojis)
          expect(arrayOfEmojis[0].emoji).toEqual('T')
        })

        describe('if value is not a string type', () => {
          it('should throw ERR_MUST_BE_A_STRING', () => {
            Object.values(emojis).forEach(emoji => emoji.emoji = true)
            
            expect(() => {
              validateEmojis(emojis)
            }).toThrow(`emoji.emoji ${ERR_MUST_BE_A_STRING}`)
          })

          it('should throw ERR_MUST_BE_A_STRING', () => {
            Object.values(emojis).forEach(emoji => emoji.emoji = undefined)
            
            expect(() => {
              validateEmojis(emojis)
            }).toThrow(`emoji.emoji ${ERR_MUST_BE_A_STRING}`)
          })
        })

        describe('if value is empty string', () => {
          it('should throw ERR_VALUE_MUST_BE_SET', () => {
            Object.values(emojis).forEach(emoji => emoji.emoji = '')
            
            expect(() => {
              validateEmojis(emojis)
            }).toThrow(`emoji.emoji ${ERR_VALUE_MUST_BE_SET}`)
          })
        })

        describe('if value contains an emoji', () => {
          it('should clip the value to only contain the emoji part', () => {
            Object.values(emojis).forEach(emoji => emoji.emoji = 'abcd🦔sdf🤣')
            const validatedEmojis = validateEmojis(emojis)
            const arrayOfEmojis = Object.values(validatedEmojis)
            expect(arrayOfEmojis[0].emoji).toEqual('🦔')
          })
        })

        describe('if value does not contain an emoji', () => {
          it('should clip the value to only contain the first char', () => {
            Object.values(emojis).forEach(emoji => emoji.emoji = 'ab')
            const validatedEmojis = validateEmojis(emojis)
            const arrayOfEmojis = Object.values(validatedEmojis)
            expect(arrayOfEmojis[0].emoji).toEqual('a')
          })
        })
      })

      describe('emoji.x', () => {
        describe('if not a number', () => {
          it('should throw ERR_MUST_BE_A_NUMBER', () => {
            Object.values(emojis).forEach(emoji => emoji.x = 'taco')
  
            expect(() => {
              validateEmojis(emojis)
            }).toThrow(`emoji.x ${ERR_MUST_BE_A_NUMBER}`)
          })
        })

        describe('if less than MIN_POSITION', () => {
          it('should set to MIN_POSITION', () => {
            Object.values(emojis).forEach(emoji => emoji.x = MIN_POSITION - 100)
            const validatedEmojis = validateEmojis(emojis)
            const arrayOfEmojis = Object.values(validatedEmojis)
            expect(arrayOfEmojis[0].x).toEqual(MIN_POSITION)
          })
        })

        describe('if more than MAX_POSITION', () => {
          it('should set to MAX_POSITION', () => {
            Object.values(emojis).forEach(emoji => emoji.x = MAX_POSITION + 100)
            const validatedEmojis = validateEmojis(emojis)
            const arrayOfEmojis = Object.values(validatedEmojis)
            expect(arrayOfEmojis[0].x).toEqual(MAX_POSITION)
          })
        })
      })

      describe('emoji.y', () => {
        describe('if not a number', () => {
          it('should throw ERR_MUST_BE_A_NUMBER', () => {
            Object.values(emojis).forEach(emoji => emoji.y = 'taco')
  
            expect(() => {
              validateEmojis(emojis)
            }).toThrow(`emoji.y ${ERR_MUST_BE_A_NUMBER}`)
          })
        })

        describe('if less than MIN_POSITION', () => {
          it('should set to MIN_POSITION', () => {
            Object.values(emojis).forEach(emoji => emoji.y = MIN_POSITION - 100)
            const validatedEmojis = validateEmojis(emojis)
            const arrayOfEmojis = Object.values(validatedEmojis)
            expect(arrayOfEmojis[0].y).toEqual(MIN_POSITION)
          })
        })

        describe('if more than MAX_POSITION', () => {
          it('should set to MAX_POSITION', () => {
            Object.values(emojis).forEach(emoji => emoji.y = MAX_POSITION + 100)
            const validatedEmojis = validateEmojis(emojis)
            const arrayOfEmojis = Object.values(validatedEmojis)
            expect(arrayOfEmojis[0].y).toEqual(MAX_POSITION)
          })
        })
      })

      describe('emoji.id', () => {
        describe('if not a Number type', () => {
          it('should throw ERR_MUST_BE_A_NUMBER', () => {
            Object.values(emojis).forEach(emoji => emoji.id = 'taco')
  
            expect(() => {
              validateEmojis(emojis)
            }).toThrow(`emoji.id ${ERR_MUST_BE_A_NUMBER}`)
          })
        })
  
        describe('if negative value', () => {
          it('should throw ERR_CANNOT_BE_NEGATIVE', () => {
            Object.values(emojis).forEach(emoji => emoji.id = -1)
  
            expect(() => {
              validateEmojis(emojis)
            }).toThrow(`emoji.id ${ERR_CANNOT_BE_NEGATIVE}`)
          })
        })
      })

      describe('emoji.order', () => {
        describe('if not a Number type', () => {
          it('should throw ERR_MUST_BE_A_NUMBER', () => {
            Object.values(emojis).forEach(emoji => emoji.order = 'taco')
  
            expect(() => {
              validateEmojis(emojis)
            }).toThrow(`emoji.order ${ERR_MUST_BE_A_NUMBER}`)
          })
        })
  
        describe('if negative value', () => {
          it('should throw ERR_CANNOT_BE_NEGATIVE', () => {
            Object.values(emojis).forEach(emoji => emoji.order = -1)
  
            expect(() => {
              validateEmojis(emojis)
            }).toThrow(`emoji.order ${ERR_CANNOT_BE_NEGATIVE}`)
          })
        })
      })

      describe('emoji.scaleX', () => {
        it('should pass a value of -1', () => {
          Object.values(emojis).forEach(emoji => emoji.scaleX = -1)
          const validatedEmojis = validateEmojis(emojis)
          const arrayOfEmojis = Object.values(validatedEmojis)
          expect(arrayOfEmojis[0].scaleX).toEqual(-1)
        })

        it('should pass a value of 1', () => {
          Object.values(emojis).forEach(emoji => emoji.scaleX = 1)
          const validatedEmojis = validateEmojis(emojis)
          const arrayOfEmojis = Object.values(validatedEmojis)
          expect(arrayOfEmojis[0].scaleX).toEqual(1)
        })

        describe('if not a number', () => {
          it('should throw ERR_MUST_BE_A_NUMBER', () => {
            Object.values(emojis).forEach(emoji => emoji.scaleX = 'taco')
  
            expect(() => {
              validateEmojis(emojis)
            }).toThrow(`emoji.scaleX ${ERR_MUST_BE_A_NUMBER}`)
          })
        })

        describe('if value is not -1 or 1', () => {
          it('2, should throw ERR_INCORRECT_SCALE_VALUE', () => {
            Object.values(emojis).forEach(emoji => emoji.scaleX = 2)
  
            expect(() => {
              validateEmojis(emojis)
            }).toThrow(`emoji.scaleX ${ERR_INCORRECT_SCALE_VALUE}`)
          })

          it('-2, should throw ERR_INCORRECT_SCALE_VALUE', () => {
            Object.values(emojis).forEach(emoji => emoji.scaleX = -22)
  
            expect(() => {
              validateEmojis(emojis)
            }).toThrow(`emoji.scaleX ${ERR_INCORRECT_SCALE_VALUE}`)
          })
        })
      })

      describe('emoji.scaleY', () => {
        it('should pass a value of -1', () => {
          Object.values(emojis).forEach(emoji => emoji.scaleY = -1)
          const validatedEmojis = validateEmojis(emojis)
          const arrayOfEmojis = Object.values(validatedEmojis)
          expect(arrayOfEmojis[0].scaleY).toEqual(-1)
        })

        it('should pass a value of 1', () => {
          Object.values(emojis).forEach(emoji => emoji.scaleY = 1)
          const validatedEmojis = validateEmojis(emojis)
          const arrayOfEmojis = Object.values(validatedEmojis)
          expect(arrayOfEmojis[0].scaleY).toEqual(1)
        })

        describe('if not a number', () => {
          it('should throw ERR_MUST_BE_A_NUMBER', () => {
            Object.values(emojis).forEach(emoji => emoji.scaleY = 'taco')
  
            expect(() => {
              validateEmojis(emojis)
            }).toThrow(`emoji.scaleY ${ERR_MUST_BE_A_NUMBER}`)
          })
        })

        describe('if value is not -1 or 1', () => {
          it('2, should throw ERR_INCORRECT_SCALE_VALUE', () => {
            Object.values(emojis).forEach(emoji => emoji.scaleY = 2)
  
            expect(() => {
              validateEmojis(emojis)
            }).toThrow(`emoji.scaleY ${ERR_INCORRECT_SCALE_VALUE}`)
          })

          it('-2, should throw ERR_INCORRECT_SCALE_VALUE', () => {
            Object.values(emojis).forEach(emoji => emoji.scaleY = -22)
  
            expect(() => {
              validateEmojis(emojis)
            }).toThrow(`emoji.scaleY ${ERR_INCORRECT_SCALE_VALUE}`)
          })
        })
      })
    })
  })
})