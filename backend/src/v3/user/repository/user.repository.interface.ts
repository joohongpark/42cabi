import { MyCabinetInfoResponseDto } from 'src/dto/response/my.cabinet.info.response.dto';
import UserStateType from 'src/enums/user.state.type.enum';
import { QueryRunner } from 'typeorm';

export interface IUserRepository {
  /**
   * 특정 유저가 대여한 사물함 정보를 가져옵니다.
   *
   * @param userId 유저 아이디
   * @return MyCabinetInfoResponseDto | null
   */
  getCabinetByUserId(userId: number): Promise<MyCabinetInfoResponseDto | null>;

  /**
   * 유저가 사물함을 빌렸는지 확인합니다.
   *
   * @param user 확인할 유저
   * @return 빌린 사물함 고유 ID (대여하지 않았을 경우 -1)
   */
  checkUserBorrowed(userId: number): Promise<number>;

  /**
   * 유저의 상태를 업데이트합니다.
   * @param user_id
   * @param state
   */
  updateUserState(user_id: number, state: UserStateType, queryRunner?: QueryRunner): Promise<void>;
}
