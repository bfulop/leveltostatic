'use strict'

var index = require('./index')

index()
  .run()
  .listen({
    onResolved: r => {
      console.log('successfully imported')
      console.log(r)
      return r
    },
    onRejected: r => {
      console.error('error importing')
      console.error(r)
      return r
    }
  })
