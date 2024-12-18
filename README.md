# grafana-auth-proxy
Auth proxy middleware for grafana with express

- 필요시 코드를 참고하여 직접 구현해서 사용하는 것을 추천
- grafana.ini 설정파일을 수정하여 auth proxy 옵션을 활성화 해야 함

```ini
#################################### Auth Proxy ##########################
[auth.proxy]
# 프록시 설정 활성화
enabled = true
# 사용할 헤더-프로퍼티 정보
header_name = X-WEBAUTH-USER
header_property = username
# 한번에 여러 정보를 세팅하려면 headers_map 사용. (Name, Role, Email, Group 등 가능)
headers = Email:X-User-Email, Name:X-User-Name
# Non-ASCII 문자열 인코드 처리
headers_encoded = false
# 그라파나에 등록안된 유저 자동 등록
auto_sign_up = true
# 캐시 지속 분 수
sync_ttl = 60
# 프록시 서버의 주소 전달 - 외부 서버에서 요청하는경우 해당 ip 세팅
whitelist = 127.0.0.1, ::1, 192.168.0.0/16
# 별도 로그인 토큰 세팅 여부 - 프록시로 로그인만 처리할 때 사용
enable_login_token = false

#################################### Server ####################################
[server]
# 기본적인 그라파나 주소 정보 - 필요시 수정
;protocol = http
;http_port = 3000
# 서브도메인 사용할 때 수정 > root_url에 사용되는 도메인, root(/)로 접근시 리다이렉트할 때 사용
domain = localhost
;domain = admin.service.com

# 서브도메인 사용할 때 수정 > ip가 아니라 도메인 주소 사용해서 http_port 제거 후 /grafana 서브경로 추가함
root_url = %(protocol)s://%(domain)s:%(http_port)s
;root_url = %(protocol)s://%(domain)s/grafana
# 서브도메인을 사용할 때 true로 세팅
serve_from_sub_path = true
```

- 개발 과정: https://rowan-apricot-295.notion.site/Nodejs-15b3963bcee380c282e1dab55a19f9cc#15e3963bcee380b0ba7af53a13b2e6ba