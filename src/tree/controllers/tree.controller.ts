import { Controller, Get } from '@nestjs/common';
import { TreeService } from '../services/tree.service';

@Controller('tree')
export class TreeController {
    constructor( private treeService: TreeService) {}

    @Get('generate')
    generateTree() {
        return this.treeService.findData();
    }
}
