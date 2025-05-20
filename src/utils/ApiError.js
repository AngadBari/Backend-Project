class ApiError extends Error{
    constructor(
        statusCode,
        message="Someting wait wrong",
        error=[],
        statck=""
        
    ){
        super(message)
        this.statusCode=statusCode
        this.data=null,
        this.message=message,
        this.success=false
        this.error=error

        if (statck){
            this.stack=this.statck
        }
        else{
            Error.captureStackTrace(this,this.constructor)
        }
    }
}

export {ApiError}