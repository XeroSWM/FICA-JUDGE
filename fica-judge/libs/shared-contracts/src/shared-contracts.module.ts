import { Module } from '@nestjs/common';
import { SharedContractsService } from './shared-contracts.service';

@Module({
  providers: [SharedContractsService],
  exports: [SharedContractsService],
})
export class SharedContractsModule {}
