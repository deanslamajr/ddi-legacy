import cloneDeep from 'lodash/cloneDeep'

import {
  ERR_MUST_BE_A_HEX_COLOR,
  ERR_FILENAME_INVALID,
  ERR_CANNOT_BE_NEGATIVE,
  ERR_INCORRECT_SCALE_VALUE,
  ERR_MUST_BE_A_NUMBER,
  ERR_MUST_BE_A_STRING,
  ERR_VALUE_MUST_BE_SET,
  ERR_EXCEED_MAX_EMOJIS,
  validateBackgroundColor,
  validateEmojis,
  validateFilename,
  validateId,
  validateStudioState,
  validateCaption
} from './validators'

import {
  MIN_POSITION,
  MAX_POSITION,
  MIN_ROTATION,
  MAX_ROTATION,
  MIN_SIZE,
  MAX_SIZE,
  MIN_ALPHA,
  MAX_ALPHA,
  MIN_RGB,
  MAX_RGB,
  MIN_OPACITY,
  MAX_OPACITY,
  MAX_EMOJIS_COUNT
} from '../config/constants.json'

function generateEmoji (newId) {
  return {
    emoji: '🦔',
    id: newId,
    order: newId,
    x: 15,
    y: 10,
    scaleX: 1,
    scaleY: 1,
    rotation: 0,
    size: 180,
    alpha: 0,
    red: 0,
    green: 0,
    blue: 0,
    opacity: 1
  }
}

const validStudioState = {
  activeEmojiId: 1,
  backgroundColor: '#aaaaaa',
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
      blue: 0,
      opacity: 1,
      filters: ['RGBA']
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
      red: 255,
      green: 255,
      blue: 255,
      opacity: 1,
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
      blue: 0,
      opacity: 1,
      filters: ['RGBA']
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
      red: 255,
      green: 0,
      blue: 0,
      opacity: 1
    }
  },
  caption: ''
}

describe('validators', () => {
  describe('validateFilename', () => {
    it('should strip the .png suffix from the filename before testing', () => {
      // a 13 character filename should pass validation but with the
      // 4 extra characters from the suffix .png this validation
      // _would fail_ if the suffix was not stripped
      expect(() => {
        validateFilename('0123456789012.png')
      }).not.toThrow()
    })

    describe('if filename doesnt have .png suffix', () => {
      it('should throw', () => {
        expect(() => {
          validateFilename('noExtension')
        }).toThrow(ERR_FILENAME_INVALID)
      })
    })

    describe('if filename has any `.` characters other than the one in the extension `.png`', () => {
      it('should throw', () => {
        expect(() => {
          validateFilename('taco.fun.png')
        }).toThrow(ERR_FILENAME_INVALID)
      })
    })

    describe('if filename has any non alphanumeric characters other than _-', () => {
      it('should throw', () => {
        expect(() => {
          validateFilename('$urf$up.png')
        }).toThrow(ERR_FILENAME_INVALID)
      })
    })

    describe('if filename has spaces', () => {
      it('should throw', () => {
        expect(() => {
          validateFilename('with spaces.png')
        }).toThrow(ERR_FILENAME_INVALID)
      })
    })

    describe('if filename is longer than 14 characters', () => {
      it('should throw', () => {
        expect(() => {
          validateFilename('012345678901234.png')
        }).toThrow(ERR_FILENAME_INVALID)
      })
    })
  })

  describe('validateCaption', () => {
    describe('if value is longer than 255 characters', () => {
      it('should be clipped to the first 255 characters', () => {
        const tooLongCaption = 'PMjiGzHtLxMUns5ZhbIlaoogREylI8DEDRBQclE9H62ZAOoKifQj054UArwLSly69oECbNeCSiq0PAwJz02qE35jFjYB7WCvuM77zmFKbldhYcmxidffi8u4OQGHarXcn5FFY28oTufNYuk2cLgnXaEoN6PU2u20ci3Cm2iHxD1NljRjhfHuj9hWxzu7YZbmoS5LtRzBwwMJ3tYSeEeqAqcTc7a2SqXenBTTVW2zi8WS9gmxMmQsPD0pb6mJHY6X'
        const validatedCaption = validateCaption(tooLongCaption)
        expect(validatedCaption.length).toEqual(255)
      })
    })
  })

  describe('validateBackgroundColor', () => {
    const SOME_FIELD = 'SOME_FIELD';

    it('should return a valid hex string', () => {
      const validHex = '#aabbcc';

      const actual = validateBackgroundColor(validHex, SOME_FIELD);
      expect(actual).toEqual(validHex);
    });

    describe('if not a hex string', () => {
      it('should throw ERR_MUST_BE_A_HEX_COLOR', () => {
        expect(() => {
          validateBackgroundColor('not a hex', SOME_FIELD);
        }).toThrow(`${SOME_FIELD} ${ERR_MUST_BE_A_HEX_COLOR}`);
      });
    });
  });

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

    describe('caption', () => {
      describe('if caption is longer than 255 characters', () => {
        it('should be clipped to the first 255 characters', () => {
          const tooLongCaption = 'PMjiGzHtLxMUns5ZhbIlaoogREylI8DEDRBQclE9H62ZAOoKifQj054UArwLSly69oECbNeCSiq0PAwJz02qE35jFjYB7WCvuM77zmFKbldhYcmxidffi8u4OQGHarXcn5FFY28oTufNYuk2cLgnXaEoN6PU2u20ci3Cm2iHxD1NljRjhfHuj9hWxzu7YZbmoS5LtRzBwwMJ3tYSeEeqAqcTc7a2SqXenBTTVW2zi8WS9gmxMmQsPD0pb6mJHY6X'
          expect(tooLongCaption.length).toEqual(256)

          const incorrectStudioState = {
            ...validStudioState,
            caption: tooLongCaption
          }

          const validatedStudioState = validateStudioState(incorrectStudioState)

          expect(validatedStudioState.caption.length).toEqual(255)
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

      describe('if count of emojis exceeds MAX_EMOJIS_COUNT', () => {
        it('should throw ERR_EXCEED_MAX_EMOJIS', () => {
          const tooManyEmojis = {}

          for(let i = 0; i < (2 * MAX_EMOJIS_COUNT); i++) {
            tooManyEmojis[i] = generateEmoji(i)
          }
            
          expect(() => {
            validateEmojis(tooManyEmojis)
          }).toThrow(ERR_EXCEED_MAX_EMOJIS)
        })
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

        describe('if value is longer than 8 chars', () => {
          it('should clip the value to the first 8 chars', () => {
            Object.values(emojis).forEach(emoji => emoji.emoji = 'abcd🦔sdlkjm')
            const validatedEmojis = validateEmojis(emojis)
            const arrayOfEmojis = Object.values(validatedEmojis)
            // 🦔 counts as 2 chars, some can count for up to 7 chars (e.g. 🚣🏿‍♀️)
            expect(arrayOfEmojis[0].emoji).toEqual('abcd🦔sd')
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

      describe('emoji.rotation', () => {
        describe('if not a number', () => {
          it('should throw ERR_MUST_BE_A_NUMBER', () => {
            Object.values(emojis).forEach(emoji => emoji.rotation = 'taco')
  
            expect(() => {
              validateEmojis(emojis)
            }).toThrow(`emoji.rotation ${ERR_MUST_BE_A_NUMBER}`)
          })
        })

        describe('if less than MIN_ROTATION', () => {
          it('should set to MIN_ROTATION', () => {
            Object.values(emojis).forEach(emoji => emoji.rotation = MIN_ROTATION - 100)
            const validatedEmojis = validateEmojis(emojis)
            const arrayOfEmojis = Object.values(validatedEmojis)
            expect(arrayOfEmojis[0].rotation).toEqual(MIN_ROTATION)
          })
        })

        describe('if more than MAX_ROTATION', () => {
          it('should set to MAX_ROTATION', () => {
            Object.values(emojis).forEach(emoji => emoji.rotation = MAX_ROTATION + 100)
            const validatedEmojis = validateEmojis(emojis)
            const arrayOfEmojis = Object.values(validatedEmojis)
            expect(arrayOfEmojis[0].rotation).toEqual(MAX_ROTATION)
          })
        })
      })

      describe('emoji.size', () => {
        describe('if not a number', () => {
          it('should throw ERR_MUST_BE_A_NUMBER', () => {
            Object.values(emojis).forEach(emoji => emoji.size = 'taco')
  
            expect(() => {
              validateEmojis(emojis)
            }).toThrow(`emoji.size ${ERR_MUST_BE_A_NUMBER}`)
          })
        })

        describe('if less than MIN_SIZE', () => {
          it('should set to MIN_SIZE', () => {
            Object.values(emojis).forEach(emoji => emoji.size = MIN_SIZE - 100)
            const validatedEmojis = validateEmojis(emojis)
            const arrayOfEmojis = Object.values(validatedEmojis)
            expect(arrayOfEmojis[0].size).toEqual(MIN_SIZE)
          })
        })

        describe('if more than MAX_SIZE', () => {
          it('should set to MAX_SIZE', () => {
            Object.values(emojis).forEach(emoji => emoji.size = MAX_SIZE + 100)
            const validatedEmojis = validateEmojis(emojis)
            const arrayOfEmojis = Object.values(validatedEmojis)
            expect(arrayOfEmojis[0].size).toEqual(MAX_SIZE)
          })
        })
      })

      describe('emoji.alpha', () => {
        describe('if not a number', () => {
          it('should throw ERR_MUST_BE_A_NUMBER', () => {
            Object.values(emojis).forEach(emoji => emoji.alpha = 'taco')
  
            expect(() => {
              validateEmojis(emojis)
            }).toThrow(`emoji.alpha ${ERR_MUST_BE_A_NUMBER}`)
          })
        })

        describe('if less than MIN_ALPHA', () => {
          it('should set to MIN_ALPHA', () => {
            Object.values(emojis).forEach(emoji => emoji.alpha = MIN_ALPHA - 1)
            const validatedEmojis = validateEmojis(emojis)
            const arrayOfEmojis = Object.values(validatedEmojis)
            expect(arrayOfEmojis[0].alpha).toEqual(MIN_ALPHA)
          })
        })

        describe('if more than MAX_ALPHA', () => {
          it('should set to MAX_ALPHA', () => {
            Object.values(emojis).forEach(emoji => emoji.alpha = MAX_ALPHA + 1)
            const validatedEmojis = validateEmojis(emojis)
            const arrayOfEmojis = Object.values(validatedEmojis)
            expect(arrayOfEmojis[0].alpha).toEqual(MAX_ALPHA)
          })
        })
      })

      describe('emoji.red', () => {
        describe('if not a number', () => {
          it('should throw ERR_MUST_BE_A_NUMBER', () => {
            Object.values(emojis).forEach(emoji => emoji.red = 'taco')
  
            expect(() => {
              validateEmojis(emojis)
            }).toThrow(`emoji.red ${ERR_MUST_BE_A_NUMBER}`)
          })
        })

        describe('if less than MIN_RGB', () => {
          it('should set to MIN_RGB', () => {
            Object.values(emojis).forEach(emoji => emoji.red = MIN_RGB - 100)
            const validatedEmojis = validateEmojis(emojis)
            const arrayOfEmojis = Object.values(validatedEmojis)
            expect(arrayOfEmojis[0].red).toEqual(MIN_RGB)
          })
        })

        describe('if more than MAX_RGB', () => {
          it('should set to MAX_RGB', () => {
            Object.values(emojis).forEach(emoji => emoji.red = MAX_RGB + 100)
            const validatedEmojis = validateEmojis(emojis)
            const arrayOfEmojis = Object.values(validatedEmojis)
            expect(arrayOfEmojis[0].red).toEqual(MAX_RGB)
          })
        })
      })

      describe('emoji.blue', () => {
        describe('if not a number', () => {
          it('should throw ERR_MUST_BE_A_NUMBER', () => {
            Object.values(emojis).forEach(emoji => emoji.blue = 'taco')
  
            expect(() => {
              validateEmojis(emojis)
            }).toThrow(`emoji.blue ${ERR_MUST_BE_A_NUMBER}`)
          })
        })

        describe('if less than MIN_RGB', () => {
          it('should set to MIN_RGB', () => {
            Object.values(emojis).forEach(emoji => emoji.blue = MIN_RGB - 100)
            const validatedEmojis = validateEmojis(emojis)
            const arrayOfEmojis = Object.values(validatedEmojis)
            expect(arrayOfEmojis[0].blue).toEqual(MIN_RGB)
          })
        })

        describe('if more than MAX_RGB', () => {
          it('should set to MAX_RGB', () => {
            Object.values(emojis).forEach(emoji => emoji.blue = MAX_RGB + 100)
            const validatedEmojis = validateEmojis(emojis)
            const arrayOfEmojis = Object.values(validatedEmojis)
            expect(arrayOfEmojis[0].blue).toEqual(MAX_RGB)
          })
        })
      })

      describe('emoji.green', () => {
        describe('if not a number', () => {
          it('should throw ERR_MUST_BE_A_NUMBER', () => {
            Object.values(emojis).forEach(emoji => emoji.green = 'taco')
  
            expect(() => {
              validateEmojis(emojis)
            }).toThrow(`emoji.green ${ERR_MUST_BE_A_NUMBER}`)
          })
        })

        describe('if less than MIN_RGB', () => {
          it('should set to MIN_RGB', () => {
            Object.values(emojis).forEach(emoji => emoji.green = MIN_RGB - 100)
            const validatedEmojis = validateEmojis(emojis)
            const arrayOfEmojis = Object.values(validatedEmojis)
            expect(arrayOfEmojis[0].green).toEqual(MIN_RGB)
          })
        })

        describe('if more than MAX_RGB', () => {
          it('should set to MAX_RGB', () => {
            Object.values(emojis).forEach(emoji => emoji.green = MAX_RGB + 100)
            const validatedEmojis = validateEmojis(emojis)
            const arrayOfEmojis = Object.values(validatedEmojis)
            expect(arrayOfEmojis[0].green).toEqual(MAX_RGB)
          })
        })
      })

      describe('emoji.opactiy', () => {
        describe('if not a number', () => {
          it('should set to MAX_OPACITY', () => {
            Object.values(emojis).forEach(emoji => emoji.opacity = 'taco')
  
            const validatedEmojis = validateEmojis(emojis)
            const arrayOfEmojis = Object.values(validatedEmojis)
            expect(arrayOfEmojis[0].opacity).toEqual(MAX_OPACITY)
          })
        })

        describe('if less than MIN_OPACITY', () => {
          it('should set to MIN_OPACITY', () => {
            Object.values(emojis).forEach(emoji => emoji.opacity = MIN_OPACITY - 1)
            const validatedEmojis = validateEmojis(emojis)
            const arrayOfEmojis = Object.values(validatedEmojis)
            expect(arrayOfEmojis[0].opacity).toEqual(MIN_OPACITY)
          })
        })

        describe('if more than MAX_OPACITY', () => {
          it('should set to MAX_OPACITY', () => {
            Object.values(emojis).forEach(emoji => emoji.opacity = MAX_OPACITY + 1)
            const validatedEmojis = validateEmojis(emojis)
            const arrayOfEmojis = Object.values(validatedEmojis)
            expect(arrayOfEmojis[0].opacity).toEqual(MAX_OPACITY)
          })
        })
      })

      describe('emoji.filters', () => {
        it('should return an array of the recognized filters from the input array', () => {
          const filters = ['RGBA']
          Object.values(emojis).forEach(emoji => emoji.filters = filters)
          const validatedEmojis = validateEmojis(emojis)
          const arrayOfEmojis = Object.values(validatedEmojis)
          expect(arrayOfEmojis[0].filters).toEqual(filters)
        })

        describe('if a falsey value', () => {
          it('should set to undefined', () => {
            Object.values(emojis).forEach(emoji => emoji.filters = undefined)
            const validatedEmojis = validateEmojis(emojis)
            const arrayOfEmojis = Object.values(validatedEmojis)
            expect(arrayOfEmojis[0].filters).toEqual(undefined)
          })
        })

        describe('if not an array', () => {
          it('should set to undefined', () => {
            Object.values(emojis).forEach(emoji => emoji.filters = true)
            const validatedEmojis = validateEmojis(emojis)
            const arrayOfEmojis = Object.values(validatedEmojis)
            expect(arrayOfEmojis[0].filters).toEqual(undefined)
          })
        })

        describe('if any array values exist that are not string type', () => {
          it('should remove the item from array', () => {
            Object.values(emojis).forEach(emoji => emoji.filters = [true, 16.45, 'RGBA'])
            const validatedEmojis = validateEmojis(emojis)
            const arrayOfEmojis = Object.values(validatedEmojis)
            expect(arrayOfEmojis[0].filters).toEqual(['RGBA'])
          })

          describe('if the remaining array is empty', () => {
            it('should set to undefined', () => {
              Object.values(emojis).forEach(emoji => emoji.filters = [true, 16.45])
              const validatedEmojis = validateEmojis(emojis)
              const arrayOfEmojis = Object.values(validatedEmojis)
              expect(arrayOfEmojis[0].filters).toEqual(undefined)
            })
          })
        })

        describe('if any array values are not recognized', () => {
          it('should remove the item from array', () => {
            Object.values(emojis).forEach(emoji => emoji.filters = ['RGBA', 'UnrecognizedFilter'])
            const validatedEmojis = validateEmojis(emojis)
            const arrayOfEmojis = Object.values(validatedEmojis)
            expect(arrayOfEmojis[0].filters).toEqual(['RGBA'])
          })

          describe('if the remaining array is empty', () => {
            it('should set to undefined', () => {
              Object.values(emojis).forEach(emoji => emoji.filters = ['UnrecognizedFilter'])
            const validatedEmojis = validateEmojis(emojis)
            const arrayOfEmojis = Object.values(validatedEmojis)
            expect(arrayOfEmojis[0].filters).toEqual(undefined)
            })
          })
        })

        describe('if any recognized array value exists more than once', () => {
          it('should remove the duplicate item(s) from array', () => {
            const validatedFilters = ['RGBA']
            const duplicateFilters = ['RGBA', 'RGBA', 'RGBA']
            Object.values(emojis).forEach(emoji => emoji.filters = duplicateFilters)
            const validatedEmojis = validateEmojis(emojis)
            const arrayOfEmojis = Object.values(validatedEmojis)
            expect(arrayOfEmojis[0].filters).toEqual(validatedFilters)
          })
        })
      })
    })
  })
})