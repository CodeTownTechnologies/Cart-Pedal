<!DOCTYPE html>
<html>
<body>

<?php

$txt = "PHP";
echo "I love $txt!";

$url = "https://fcm.googleapis.com/fcm/send";
$server_key="AAAA13viyLU:APA91bGy2cgdb1reuJUZLzqRsNM_0AxUihyxKOxtDwDtV-7-AxZdQTcQwbXvDEaJmSm879_BqW-3IBsVALc6SgM-BbcPlFnSOtxIdr6PDW19IpUS0TbDaPH9M9xdxfH9Ck0_BWsw0H7K";

$fields = array
            ("notification" => array(
                                "title" => "Cartpedal", 
                                "body" => "Testing", 
                                "priority" => "high",
                                "content_available" => true,
                                "android_channel_id" => "test-channel",
                                "color" => "#fe3760",
                                "sound" => "default", 
                                "badge" => 1, 
                              ),
            "data" => array("title" => "Cartpedal", 
                            "body" => "Testing", 
                            "sound" => "default", 
                            "badge" => 1, 
                            )
             ); 
             
 $fields["to"] = "fGeP6RibTYmVSCQcDvOEaa:APA91bGSegPWl-Mb85nlsaykGIF74a-f9cZMbKWb-uRfj7Llin3W-Hx31i2275ghwXUx4Q0L_9KF1tWueB-m5CaE2MfSAKdCTJAJ6ZvL6LRai9ZKVhXk2yxaAlrBhQsqJ72LiLkNzpEo";
 
 
 $headers = array(
            'Content-Type:application/json',
            'Authorization:key=' . $server_key
        );
        
 $ch = curl_init();
 curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($fields));
        $result = curl_exec($ch);

if($result){
  echo "PUSHED"
} else {
   echo "NOT PUSHED"; 
}

?>

</body>
</html>
