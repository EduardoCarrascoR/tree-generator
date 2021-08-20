import { HttpModule, Module } from '@nestjs/common';
import { TreeService } from './services/tree.service';
import { TreeController } from './controllers/tree.controller';

@Module({
  imports: [HttpModule],
  providers: [TreeService],
  controllers: [TreeController]
})
export class TreeModule {}
