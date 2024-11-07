# javascript-convenience-store-precourse

로또 발매기 게임은 사용자가 입력한 구입 금액에 따라 로또 번호를 자동 발행하고, 당첨 번호와 비교해 당첨 내역과 수익률을 계산해주는 프로그램입니다.

## 기능 목록 정리

### 시작 문구 출력하기

- [ ] 환영 인사 출력한다.
- [ ] 프로모션 정보 초기화한다.
- [ ] 현재 상품명, 가격, 프로모션 이름, 재고 초기화한다.
- [ ] 현재 상품명, 가격, 프로모션 이름, 재고 출력한다.

### 사용자 입력 받기

- [ ] 구매할 상품명과 수량을 입력 받는다.

### 구매할 상품명과 수량으로 안내 메시지 출력

- [ ] 프로모션 적용이 가능한 상품에 대해 고객이 해당 수량만큼 가져오지 않았을 경우
  - [ ] 해당 경우인지 판단한다.
  - [ ] 그 수량만큼 추가 여부를 안내 메시지를 출력하면서 응답을 입력받는다.
  - [ ] Y 일 경우, 증정 받을 수 있는 상품을 추가한다.
  - [ ] N 일 경우, 증정 받을 수 있는 상품을 추가하지 않는다.
- [ ] 프로모션 재고가 부족하여 일부 수량을 프로모션 혜택 없이 결제해야 하는 경우
  - [ ] 해단 경우인지 판단한다.
  - [ ] 일부 수량에 대해 정가로 결제할지 안내 메시지를 출력하면서 응답을 입력받는다.
  - [ ] Y 일 경우, 일부 수량에 대해 정가로 결제한다.
  - [ ] N 일 경우, 정가로 결제해야하는 수량만큼 제외한 후 결제를 진행한다.

### 멤버십 할인 여부 입력 받기

- [ ] 멤버십 할인 적용 여부를 입력 받는다.
- [ ] Y 일 경우
  - [ ] 프로모션 미적용 금액의 30%를 할인받는다.
  - [ ] 프로모션 적용 후 남은 금액에 대해 멤버십 할인을 적용한다.
  - [ ] 멤버십 할인의 최대 한도는 8,000원이다.
- [ ] N 일 경우, 멤버십 할인을 적용하지 않는다.

### 영수증 출력

- [ ] 구매 내역을 출력한다.
- [ ] 증정품이 있는 경우, 증정품을 출력한다.
- [ ] 할인 금액을 출력한다.
- [ ] 총 결제 금액을 출력한다.

### 추가 구매 여부 입력 받기

- [ ] 추가 구매를 원하는지 입력 받는다.
- [ ] Y 일 경우, 구매 프로세스를 다시 시작한다.
- [ ] N 일 경우, 시스템을 종료한다.

### 예외 처리

- [ ] 사용자 입력 값이 유효하지 않은 경우
  - [ ] 구매할 상품과 수량 형식이 올바르지 않은 경우
  - [ ] 존재하지 않는 상품을 입력한 경우
  - [ ] 구매 수량이 재고 수량을 초과한 경우
  - [ ] 기타 잘못된 입력의 경우

## 추가 고려 사항 (마지막에 모든 조건을 반영했는지 확인)

### 프로그래밍 요구 사항

- [ ] indent(인덴트, 들여쓰기) depth를 3이 넘지 않도록 구현한다. 2까지만 허용한다.
- [ ] 3항 연산자를 쓰지 않는다.
- [ ] 함수(또는 메서드)가 한 가지 일만 하도록 최대한 작게 만들어라.
- [ ] Jest를 이용하여 정리한 기능 목록이 정상적으로 작동하는지 테스트 코드로 확인한다.
- [ ] else를 지양한다.
- [ ] 함수(또는 메서드)의 길이가 10라인을 넘어가지 않도록 구현한다.
- [ ] 구현한 기능에 대한 단위 테스트를 작성한다.
- [ ] 입출력을 담당하는 클래스를 별도로 구현한다.

### 4주 차 학습 목표

- [ ] 관련 함수를 묶어 클래스를 만들고, 객체들이 협력하여 하나의 큰 기능을 수행하도록 한다.
- [ ] 클래스와 함수에 대한 단위 테스트를 통해 의도한 대로 정확하게 작동하는 영역을 확보한다.
- [ ] 3주 차 공통 피드백을 최대한 반영한다.

### 3주 차 공통 피드백 반영

- [ ] 예외 상황에 대한 고민한다
- [ ] 객체의 상태 접근을 제한한다
- [ ] 객체는 객체답게 사용한다
- [ ] 필드(인스턴스 변수)의 수를 줄이기 위해 노력한다
- [ ] 성공하는 케이스 뿐만 아니라 예외 케이스도 테스트한다
- [ ] 단위 테스트하기 좋은 메서드로 만든다.