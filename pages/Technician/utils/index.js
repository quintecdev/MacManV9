export const formatTime = (timer) => {
    const getSeconds = `0${(timer % 60)}`.slice(-2)
    // const minutes = `${}`
  
    return `${getHours(timer)} : ${getMinutes(timer)} : ${getSeconds}`
  }

    export const getHours =(timer)=> {
    return `${Math.floor(timer / 3600)}`.padStart(2,'0')//slice(-2)
  }
    export const getMinutes = (timer) => `0${Math.floor(timer / 60) % 60}`.slice(-2)
  

  export const formatTimeHhmm = (timer) => {
    // const getSeconds = `0${(timer % 60)}`.slice(-2)
    const minutes = `${Math.floor(timer / 60)}`
    const getMinutes = `0${minutes % 60}`.slice(-2)
    const getHours = `0${Math.floor(timer / 3600)}`.slice(-2)
    //: ${getSeconds}`
  
    return `${getHours} : ${getMinutes}` 
  }

  export const getCloser = (value, checkOne, checkTwo) =>
  Math.abs(value - checkOne) < Math.abs(value - checkTwo) ? checkOne : checkTwo;