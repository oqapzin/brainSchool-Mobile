import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post as HttpPost,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment } from './entities/comment.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

type AuthenticatedRequest = { user: { id: number; role: string } };

@ApiTags('comments')
@ApiBearerAuth('token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get('posts/:postId/comments')
  @Roles('professor', 'aluno')
  @ApiOperation({ summary: 'Lista os comentários de uma postagem' })
  @ApiParam({ name: 'postId', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Comentários encontrados',
    type: [Comment],
  })
  @ApiResponse({ status: 404, description: 'Postagem não encontrada' })
  findByPost(
    @Param('postId', ParseIntPipe) postId: number,
  ): Promise<Comment[]> {
    return this.commentsService.findByPost(postId);
  }

  @HttpPost('posts/:postId/comments')
  @Roles('professor', 'aluno')
  @ApiOperation({ summary: 'Cria um comentário em uma postagem' })
  @ApiParam({ name: 'postId', example: 1 })
  @ApiResponse({ status: 201, description: 'Comentário criado', type: Comment })
  @ApiResponse({
    status: 404,
    description: 'Postagem ou usuário não encontrado',
  })
  create(
    @Param('postId', ParseIntPipe) postId: number,
    @Body() createCommentDto: CreateCommentDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<Comment> {
    return this.commentsService.create(
      postId,
      createCommentDto,
      request.user.id,
    );
  }

  @Get('comments/:id')
  @Roles('professor', 'aluno')
  @ApiOperation({ summary: 'Busca um comentário pelo id' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Comentário encontrado',
    type: Comment,
  })
  @ApiResponse({ status: 404, description: 'Comentário não encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Comment> {
    return this.commentsService.findOne(id);
  }

  @Put('comments/:id')
  @Roles('professor', 'aluno')
  @ApiOperation({ summary: 'Edita um comentário próprio' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Comentário atualizado',
    type: Comment,
  })
  @ApiResponse({ status: 403, description: 'Somente o autor pode editar' })
  @ApiResponse({ status: 404, description: 'Comentário não encontrado' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCommentDto: UpdateCommentDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<Comment> {
    return this.commentsService.update(id, updateCommentDto, request.user);
  }

  @Delete('comments/:id')
  @Roles('professor', 'aluno')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Exclui um comentário próprio ou qualquer comentário como docente',
  })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({ status: 204, description: 'Comentário excluído' })
  @ApiResponse({
    status: 403,
    description: 'Somente o autor ou um docente pode excluir',
  })
  @ApiResponse({ status: 404, description: 'Comentário não encontrado' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
  ): Promise<void> {
    return this.commentsService.remove(id, request.user);
  }
}
