import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import CabinetStatusType from 'src/enums/cabinet.status.type.enum';
import { CabinetInfoService } from '../cabinet/cabinet.info.service';
import { LentTools } from '../lent/lent.component';
import { LentService } from '../lent/lent.service';
import { EmailSender } from './email.sender.component';
import {
  Transactional,
  Propagation,
  runOnTransactionComplete,
  IsolationLevel,
} from 'typeorm-transactional';
import Lent from 'src/entities/lent.entity';
import { ConfigService } from '@nestjs/config';
import { DateCalculator } from './date.calculator.component';

@Injectable()
export class ExpiredChecker {
  private logger = new Logger(ExpiredChecker.name);
  constructor(
    private readonly lentTools: LentTools,
    private readonly lentService: LentService,
    private readonly emailsender: EmailSender,
    private cabinetInfoService: CabinetInfoService,
    private dateCalculator: DateCalculator,
    @Inject(ConfigService) private configService: ConfigService,
  ) {}

  @Transactional({
    propagation: Propagation.REQUIRED,
    isolationLevel: IsolationLevel.SERIALIZABLE,
  })
  async checkExpiredCabinetEach(lent: Lent) {
    const days = await this.dateCalculator.calDateDiff(
      lent.expire_time,
      new Date(),
    );
    if (days >= this.configService.get<number>('expire_term.soonoverdue')) {
      if (
        days > 0 &&
        days < this.configService.get<number>('expire_term.forcedreturn')
      ) {
        if (lent.cabinet.status !== CabinetStatusType.EXPIRED) {
          await this.cabinetInfoService.updateCabinetStatus(
            lent.lent_cabinet_id,
            CabinetStatusType.EXPIRED,
          );
        }
      } else if (
        days >= this.configService.get<number>('expire_term.forcedreturn')
      ) {
        await this.cabinetInfoService.updateCabinetStatus(
          lent.lent_cabinet_id,
          CabinetStatusType.BANNED,
        );
        await this.lentService.returnCabinet({
          user_id: lent.lent_user_id,
          intra_id: lent.user.intra_id,
        });
      }
      this.emailsender.mailing(lent.user.intra_id, days);
    }
    runOnTransactionComplete((err) => err && this.logger.error(err));
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkExpiredLent() {
    this.logger.debug(
      `Called ${ExpiredChecker.name} ${this.checkExpiredLent.name}`,
    );
    const lentList = await Promise.all(await this.lentTools.getAllLent());
    for await (const lent of lentList) {
      if (lent.expire_time === null) continue;
      await this.checkExpiredCabinetEach(lent);
      await new Promise((resolve) => {
        setTimeout(resolve, 2000);
      });
    }
  }
}
