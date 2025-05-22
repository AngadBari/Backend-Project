class ApiError extends Error{
    constructor(
        statusCode,
        message="Someting wait wrong",
        error=[],
        stack=""
        
    ){
        super(message)
        this.statusCode=statusCode
        this.data=null,
        this.message=message,
        this.success=false
        this.error=error

        if (stack){
            this.stack=this.stack
        }
        else{
            Error.captureStackTrace(this,this.constructor)
        }
    }
}

export {ApiError}