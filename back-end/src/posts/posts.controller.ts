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
  Req,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('posts')
@ApiBearerAuth('token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @HttpPost()
  @Roles('professor')
  @ApiOperation({ summary: 'Cria uma nova postagem' })
  @ApiResponse({
    status: 201,
    description: 'Postagem criada com sucesso',
    type: Post,
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Acesso proibido (requer perfil de professor)',
  })
  create(
    @Body() createPostDto: CreatePostDto,
    @Req() request?: { user: { username: string } },
  ): Promise<Post> {
    return request
      ? this.postsService.create(createPostDto, request.user)
      : this.postsService.create(createPostDto);
  }

  @Get()
  @Roles('professor', 'aluno')
  @ApiOperation({ summary: 'Lista todas as postagens' })
  @ApiResponse({
    status: 200,
    description: 'Lista de postagens retornada com sucesso',
    type: [Post],
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  findAll(): Promise<Post[]> {
    return this.postsService.findAll();
  }

  @Get('search')
  @Roles('professor', 'aluno')
  @ApiOperation({ summary: 'Busca postagens por palavra-chave' })
  @ApiQuery({
    name: 'q',
    required: true,
    description: 'Termo de busca a ser procurado no título ou conteúdo',
    example: 'matemática',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de postagens que correspondem ao termo buscado',
    type: [Post],
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  search(@Query('q') term: string): Promise<Post[]> {
    return this.postsService.search(term);
  }

  @Get(':id')
  @Roles('professor', 'aluno')
  @ApiOperation({ summary: 'Retorna o conteúdo completo de uma postagem' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({ status: 200, description: 'Postagem encontrada', type: Post })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Postagem não encontrada' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Post> {
    return this.postsService.findOne(id);
  }

  @Put(':id')
  @Roles('professor')
  @ApiOperation({ summary: 'Edita uma postagem existente' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Postagem atualizada com sucesso',
    type: Post,
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Acesso proibido (requer perfil de professor)',
  })
  @ApiResponse({ status: 404, description: 'Postagem não encontrada' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
    @Req() request?: { user: { username: string } },
  ): Promise<Post> {
    return request
      ? this.postsService.update(id, updatePostDto, request.user)
      : this.postsService.update(id, updatePostDto);
  }

  @Delete(':id')
  @Roles('professor')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Exclui uma postagem' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({ status: 204, description: 'Postagem excluída com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Acesso proibido (requer perfil de professor)',
  })
  @ApiResponse({ status: 404, description: 'Postagem não encontrada' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() request?: { user: { username: string } },
  ): Promise<void> {
    return request
      ? this.postsService.remove(id, request.user)
      : this.postsService.remove(id);
  }
}
