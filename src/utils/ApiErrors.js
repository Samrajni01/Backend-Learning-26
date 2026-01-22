class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong",
    errors= [],
    stack = ""
  ) {
    super(message)
    this.statusCode = statusCode
    this.message = message
    this.data = null
    this.success=false;
    this.errors=errors;


    if(stack){
        this.stack=stack;
    }else{
        Error.captureStackTrace(this,this.constructor)
    }
  }
}

/*Thing	Why it exists
statusCode	HTTP needs it
message	human readable
errors	validation errors
stack	debugging*/

export {ApiError}
