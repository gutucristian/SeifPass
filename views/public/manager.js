$( document ).ready(function() {
    function generatePassword() {
        var length = 8,
            charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
            retVal = "";
        for (var i = 0, n = charset.length; i < length; ++i) {
            retVal += charset.charAt(Math.floor(Math.random() * n));
        }
        return retVal;
    }
    
    $("#inputPassword").prop("disabled",true);
    $("#edit").prop("disabled",true);
    $("#save").prop("disabled",true);
    
    $("#generate").on("click",function() {
        var password = generatePassword();        
        
        $("#inputPassword").prop("disabled",true);   
        $("#inputPassword").val(password);
        $("#edit").prop("disabled",false);
        $("#save").prop("disabled",false);        
    });
    
    $("#edit").on("click",function() {
        $("#inputPassword").prop("disabled",false);
    });
    
    $("#save").on("click",function() {
        // TODO: encrypt password before sending to server
        console.log('save clicked');
        var password = $("#inputPassword").val();
        var accountName =  $("#inputAccount").val();
        console.log('password = ' + password);
        console.log('accountName = ' + accountName);
        if(password != "" && accountName != ""){
            $.ajax({
                type: "POST",
                url: "http://localhost:8000/addPassword",                
                dataType: "json",                       
                data: {"accountName": accountName, "password": password},
                success: function(data){
                    console.log(data);
                },
                failure: function(errMsg) {
                    console.log(errMsg);
                }
            });            
        }else{
            console.log('input a password');
        }        
    }); 
});