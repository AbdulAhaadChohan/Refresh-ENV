$m=[Environment]::GetEnvironmentVariables('Machine');$u=[Environment]::GetEnvironmentVariables('User')
foreach($k in (@($m.Keys)+@($u.Keys))){if($k -ne 'PATH'){$v=if($u.Contains($k)){$u[$k]}else{$m[$k]};Set-Item ('Env:'+$k) $v}}
$env:PATH=[Environment]::GetEnvironmentVariable('PATH','Machine')+';'+[Environment]::GetEnvironmentVariable('PATH','User')
