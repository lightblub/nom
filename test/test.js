const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')

chai.use(chaiAsPromised)
chai.should()

describe('parser', () => {
  const parser = require('../src/parser')

  describe('literals', () => {
    describe('strings', () => {
      it('double quoted', () =>
        parser.parse(`"hello"`).should.eventually.deep.equal(
          [
            ['expr', [
              'string',
              'hello'
            ]]
          ]
        )
      )

      it('single quoted', () =>
        parser.parse(`'hello'`).should.eventually.deep.equal(
          [
            ['expr', [
              'string',
              'hello'
            ]]
          ]
        )
      )

      it('backslash escapes', () =>
        parser.parse(`"Hello, \\"World\\"!"`).should.eventually.deep.equal(
          [
            ['expr', [
              'string',
              'Hello, "World"!'
            ]]
          ]
        )
      )
    })

    describe('numbers', () => {
      it('integers', () =>
        parser.parse(`25`).should.eventually.deep.equal(
          [
            ['expr', [
              'num',
              '25'
            ]]
          ]
        )
      )

      it('floats', () =>
        parser.parse(`3.14`).should.eventually.deep.equal(
          [
            ['expr', [
              'num',
              '3.14'
            ]]
          ]
        )
      )

      it('negatives', () =>
        parser.parse(`-1`).should.eventually.deep.equal(
          [
            ['expr', [
              '-', // negative numbers are technically (0 - n)
              [
                'num',
                '0'
              ],
              [
                'num',
                '1'
              ]
            ]]
          ]
        )
      )
    })

    describe('identifiers', () => {
      it('variables', () =>
        parser.parse(`someVariable`).should.eventually.deep.equal(
          [
            ['expr', [
              'variable',
              'someVariable'
            ]]
          ]
        )
      )

      it('classes', () =>
        parser.parse(`SomeClass`).should.eventually.deep.equal(
          [
            ['expr', [
              'class',
              'SomeClass'
            ]]
          ]
        )
      )

      it('constants', () =>
        parser.parse(`SOME_CONSTANT`).should.eventually.deep.equal(
          [
            ['expr', [
              'constant',
              'SOME_CONSTANT'
            ]]
          ]
        )
      )

      it('paths', () =>
        parser.parse(`a.b.c`).should.eventually.deep.equal(
          [
            ['expr', [
              [
                [
                  'variable',
                  'a'
                ],
                [
                  'variable',
                  'b'
                ]
              ],
              [
                'variable',
                'c'
              ]
            ]]
          ]
        )
      )
    })
  })

  describe('maths', () => {
    it('addition', () =>
      parser.parse(`1 + 2`).should.eventually.deep.equal(
        [
          ['expr', [
            '+',
            [
              'num',
              '1'
            ],
            [
              'num',
              '2'
            ]
          ]]
        ]
      )
    )

    it('subtraction', () =>
      parser.parse(`8 - 12`).should.eventually.deep.equal(
        [
          ['expr', [
            '-',
            [
              'num',
              '8'
            ],
            [
              'num',
              '12'
            ]
          ]]
        ]
      )
    )

    it('multiplication', () =>
      parser.parse(`21.9 * 2.4`).should.eventually.deep.equal(
        [
          ['expr', [
            '*',
            [
              'num',
              '21.9'
            ],
            [
              'num',
              '2.4'
            ]
          ]]
        ]
      )
    )

    it('division', () =>
      parser.parse(`3 / 4`).should.eventually.deep.equal(
        [
          ['expr', [
            '/',
            [
              'num',
              '3'
            ],
            [
              'num',
              '4'
            ]
          ]]
        ]
      )
    )

    it('powers', () => // aka exponents or indices
      parser.parse(`2^1`).should.eventually.deep.equal(
        [
          ['expr', [
            '^',
            [
              'num',
              '2'
            ],
            [
              'num',
              '1'
            ]
          ]]
        ]
      )
    )

    it('implied multiplication', () =>
      parser.parse(`2(4 + 8)`).should.eventually.deep.equal(
        [
          ['expr', [
            '*',
            [
              'num',
              '2'
            ],
            [
              '+',
              [
                'num',
                '4'
              ],
              [
                'num',
                '8'
              ]
            ]
          ]]
        ]
      )
    )

    it('order of operations', () => // BIDMAS, PEMDAS
      parser.parse(`(18 + 2) * 4 / 6.2`).should.eventually.deep.equal(
        [
          ['expr', [
            '/',
            [
              '*',
              [
                '+',
                [
                  'num',
                  '18'
                ],
                [
                  'num',
                  '2'
                ]
              ],
              [
                'num',
                '4'
              ]
            ],
            [
              'num',
              '6.2'
            ]
          ]]
        ]
      )
    )

    describe('function calls', () => {
      it('no arguments', () =>
        parser.parse(`foo()`).should.eventually.deep.equal(
          [
            ['expr', [
              'call',
              [
                'variable',
                'foo'
              ],
              [
                // none
              ]
            ]]
          ]
        )
      )

      it('one argument w/o brackets', () =>
        parser.parse(`bar 6`).should.eventually.deep.equal(
          [
            ['expr', [
              'call',
              [
                'variable',
                'bar'
              ],
              [
                [
                  'num',
                  '6'
                ]
              ]
            ]]
          ]
        )
      )

      it('one argument w/  brackets', () =>
        parser.parse(`bar(6)`).should.eventually.deep.equal(
          [
            ['expr', [
              'call',
              [
                'variable',
                'bar'
              ],
              [
                [
                  'num',
                  '6'
                ]
              ]
            ]]
          ]
        )
      )

      it('multiple arguments', () =>
        parser.parse(`baz(1, 2)`).should.eventually.deep.equal(
          [
            ['expr', [
              'call',
              [
                'variable',
                'baz'
              ],
              [
                [
                  'num',
                  '1'
                ],
                [
                  'num',
                  '2'
                ]
              ]
            ]]
          ]
        )
      )
    })
  })
})
